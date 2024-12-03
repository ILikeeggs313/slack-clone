import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

//generating a joincode
const generateCode = () => {
    const code = Array.from(
        { length: 6 },
        () => 
            "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
    ).join("");
    return code;
};

export const join = mutation({
    args:{
        joinCode: v.string(),
        workspaceId: v.id("workspaces"),
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if(!userId){
            throw new Error("Unauthorized");
        }
        const workspace = await ctx.db.get(args.workspaceId);

        if(!workspace) {
            throw new Error("Workspace not found");
        }
        if(workspace.joinCode !== args.joinCode.toLowerCase()){
            throw new Error("Invalid join code");
        }

        //if they pass the verification, get the unique member
        const existingMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
        )
            .unique();
        if(existingMember){
            throw new Error("Already a member of this workspace");
        }
        await ctx.db.insert("members", {
            userId,
            workspaceId: workspace._id,
            role:"member",
        });
        return workspace._id;
    },
});

//todo: handle uninvited guests
export const newJoinCode = mutation({
    args: {
        workspaceId: v.id("workspaces"),
    },
        handler: async(ctx, args) => {
            const userId = await auth.getUserId(ctx);
            if(!userId){
                //if not logged in, throw an error
                throw new Error("Unauthorized");
            }
            //check for unique member
            const member = await ctx.db
                .query("members")
                .withIndex("by_workspace_id_user_id", (q) => 
                    q.eq("workspaceId", args.workspaceId).eq("userId", userId)
                )
                .unique();
        if(!member || member.role !== "admin"){
            throw new Error("Unauthorized")
        }
        const joinCode = generateCode();
        await ctx.db.patch(args.workspaceId, {
            joinCode,
        });
        return args.workspaceId;
    }
})

export const create = mutation({
    args:{
        name: v.string(),
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);
    if(!userId){
        //if not logged in, throw an error
        throw new Error("Unauthorized")
    }
    //TODO: Create a proper CREATE method to joinCode - done
    const joinCode = generateCode();

    //creating any document in convex return an ID
    const workspaceId = await ctx.db.insert("workspaces",{
        name: args.name,
        userId,
        joinCode,
    });

    await ctx.db.insert("members", {
        userId,
        workspaceId,
        role: "admin"
    })

    await ctx.db.insert("channels", {
        name: "general",
        workspaceId,
    });

    return workspaceId ;
    },
});

export const get = query({ //should only show the workspace the user is a part of
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            //default an empty space, not throwing Error in query
            return [];
        }
        //fetch all members the user has
        const members = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();
            
        const workspaceIds = members.map((member) => member.workspaceId);

        const workspaces = [];

        //generate the workspace
        for(const workspaceId of workspaceIds){
            const workspace = await ctx.db.get(workspaceId);
            
            if(workspace){
                //push to the array above
                workspaces.push(workspace);
            }
        }

        return workspaces;
    },
});

export const getInfoById = query({
    args: {id: v.id("workspaces")},
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            return null;
        }
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),
            )
            //unique member only with that id
            .unique();

        const workspace = await ctx.db.get(args.id);
        return{
            name: workspace?.name,
            isMember: !!member,
        };
    },
});

export const getById = query({
    args: { id: v.id("workspaces") },
    handler: async(ctx,args) => {
        const userId = await auth.getUserId(ctx);

        //need to redirect when logging out
        if(!userId){
            throw new Error("Unauthorized");
        }
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),
            )
            //unique member only with that id
            .unique();

        if(!member){
            return null;
        }

        return await ctx.db.get(args.id)
    },
});

export const update = mutation({
    args:{
        id: v.id("workspaces"),
        name: v.string(),
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),
            )
            //unique member only with that id
            .unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }
        await ctx.db.patch(args.id, {
            name: args.name
        });
        
        return args.id;
    },
});

export const remove = mutation({
    args:{
        id: v.id("workspaces"),
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id).eq("userId", userId),
            )
            //unique member only with that id
            .unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const [members] = await Promise.all([
            ctx.db
                .query("members")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect()
        ]);


        for (const member of members){
            await ctx.db.delete(member._id);
        }
        await ctx.db.delete(args.id);
        
        return args.id;
    },
});