'use server';

import { prisma } from '@/lib/prisma';
import { User, Team, ActivityLog, WeekendChallenge, TeamBonusPoint, Post, Comment, Award } from '@/types';
import { revalidatePath } from 'next/cache';

export async function fetchAllData() {
    const [users, teams, activities, weekendChallenges, teamBonusPoints, posts, awards] = await Promise.all([
        prisma.user.findMany(),
        prisma.team.findMany({ include: { members: true, pendingRequests: true } }),
        prisma.activityLog.findMany(),
        prisma.weekendChallenge.findMany(),
        prisma.teamBonusPoint.findMany(),
        prisma.post.findMany({ include: { comments: true, likes: true } }),
        prisma.award.findMany(),
    ]);

    // Format data to match existing frontend structure perfectly
    const formattedTeams = teams.map(t => ({
        id: t.id,
        name: t.name,
        members: t.members.map(m => m.id),
        captainId: t.captainId,
        pendingRequests: t.pendingRequests.map(p => p.id),
        brandImageUrl: t.brandImageUrl || undefined
    })) as Team[];

    const formattedPosts = posts.map(p => ({
        id: p.id,
        userId: p.userId,
        content: p.content,
        mediaUrl: p.mediaUrl || undefined,
        createdAt: p.createdAt.getTime(),
        weekendChallengeId: p.weekendChallengeId || undefined,
        likes: p.likes.map(l => l.userId),
        comments: p.comments.map(c => ({
            id: c.id,
            userId: c.userId,
            content: c.content,
            createdAt: c.createdAt.getTime(),
        })) as Comment[]
    })) as Post[];

    const formattedActivities = activities.map(a => ({
        ...a,
        duration: a.duration || undefined,
        stepCount: a.stepCount || undefined,
        bonusPoints: a.bonusPoints || undefined,
    })) as ActivityLog[];

    return {
        users: users as unknown as User[],
        teams: formattedTeams,
        activities: formattedActivities,
        weekendChallenges: weekendChallenges as unknown as WeekendChallenge[],
        teamBonusPoints: teamBonusPoints as unknown as TeamBonusPoint[],
        posts: formattedPosts,
        awards: awards as unknown as Award[]
    };
}

// --------------------------------------------------------------------------
// USER / TEAM ACTIONS
// --------------------------------------------------------------------------

export async function registerUserDB(data: Omit<User, 'id'>) {
    try {
        const u = await prisma.user.create({ data: { ...data, role: data.role || 'user' } });
        revalidatePath('/', 'layout');
        return { success: true, user: u };
    } catch (e: any) {
        if(e.code === 'P2002') return { success: false, message: 'Username already exists' };
        return { success: false, message: e.message };
    }
}

export async function updateProfileDB(userId: string, data: any) {
    try {
        await prisma.user.update({ where: { id: userId }, data });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function createTeamDB(name: string, captainId: string, brandImageUrl?: string) {
    try {
        const t = await prisma.team.create({
            data: {
                name,
                brandImageUrl,
                captainId,
                members: { connect: [{ id: captainId }] }
            }
        });
        await prisma.user.update({ where: { id: captainId }, data: { teamId: t.id }});
        revalidatePath('/', 'layout');
        return t.id;
    } catch (e) {
        return null;
    }
}

// --------------------------------------------------------------------------
// ACTIVITY LOGGING
// --------------------------------------------------------------------------

export async function logActivityDB(data: any) {
    try {
        await prisma.activityLog.create({
            data: {
                ...data,
            }
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

// --------------------------------------------------------------------------
// SOCIAL WALL ACTIONS
// --------------------------------------------------------------------------

export async function createPostDB(data: any) {
    try {
        await prisma.post.create({ data });
        revalidatePath('/', 'layout');
        return true;
    } catch {
        return false;
    }
}

export async function addCommentDB(postId: string, userId: string, content: string) {
    try {
        await prisma.comment.create({ data: { postId, userId, content } });
        revalidatePath('/', 'layout');
        return true;
    } catch {
        return false;
    }
}

// --------------------------------------------------------------------------
// SEED DATABASE UTILITY (Only run if DB is completely empty)
// --------------------------------------------------------------------------
export async function seedInitialData(seedData: any) {
    const userCount = await prisma.user.count();
    if (userCount > 0) return { success: true, message: 'Database already seeded' };

    try {
        // Users
        for (const u of seedData.initialUsers) {
            await prisma.user.create({ data: {
                id: u.id, name: u.name, username: u.username, password: u.password,
                location: u.location, workStream: u.workStream, role: u.role
            }});
        }
        // Teams 
        for (const t of seedData.initialTeams) {
            await prisma.team.create({ data: {
                id: t.id, name: t.name, captainId: t.captainId,
                brandImageUrl: t.brandImageUrl,
                members: { connect: t.members.map((id: string) => ({ id })) }
            }});
            // Update users to have this teamId
            for (const uid of t.members) {
                await prisma.user.update({ where: { id: uid }, data: { teamId: t.id }});
            }
        }
        // Activities
        const chunkSize = 1000;
        for (let i=0; i < seedData.initialActivities.length; i += chunkSize) {
            const chunk = seedData.initialActivities.slice(i, i + chunkSize);
            await prisma.activityLog.createMany({ data: chunk.map((a:any) => ({
                id: a.id, userId: a.userId, date: a.date, category: a.category, points: a.points, duration: a.duration, stepCount: a.stepCount, bonusPoints: a.bonusPoints, isWeekendChallenge: a.isWeekendChallenge || false
            }))});
        }
        
        // Posts & Comments
        for (const p of seedData.initialPosts) {
            await prisma.post.create({ data: {
                id: p.id, userId: p.userId, content: p.content, createdAt: new Date(p.createdAt),
                comments: { create: p.comments.map((c:any) => ({ id: c.id, userId: c.userId, content: c.content, createdAt: new Date(c.createdAt) })) },
                likes: { create: p.likes.map((userId:string) => ({ userId })) }
            }});
        }

        return { success: true, message: 'Seeded successfully' };
    } catch(e: any) {
         console.error(e);
         return { success: false, error: e.message };
    }
}
