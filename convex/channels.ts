import { v } from "convex/values";

import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

//remove method
export const remove = mutation({
    args: { 
        id: v.id("channels"), 
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }
    
        const channel = await ctx.db.get(args.id);
        if(!channel){
            throw new Error("Channel not found");
        }

        const member = await ctx.db
        //grabbing member for the database
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
        )
        //get the unique member
        .unique();

        if(!member || member.role !== "admin"){
            throw new Error("Unauthorized")
        }
        //TODO: remove associated messages when channel is deleted


        //remove by delete
        await ctx.db.delete(args.id);

        return args.id;
    },
});

//TODO: ADD AN UPDATE METHOD
export const update = mutation({
    args: { 
        id: v.id("channels"), 
        name: v.string(),
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }
    
        const channel = await ctx.db.get(args.id);
        if(!channel){
            throw new Error("Channel not found");
        }

        const member = await ctx.db
        //grabbing member for the database
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
        )
        //get the unique member
        .unique();

        if(!member || member.role !== "admin"){
            throw new Error("Unauthorized")
        }
        
        //update by patching
        await ctx.db.patch(args.id, {
            name: args.name,
        });
        return args.id;
    },
});

export const create = mutation({
    args:{
        name: v.string(),
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        
        if(!userId){
            throw new Error("unauthorized");
        }
        
        const member = await ctx.db
            //grabbing member for the database
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId).eq("userId", userId),
            )
            //get the unique member
            .unique();
        if(!member || member.role !== "admin"){
            throw new Error("Unauthorized")
        }
        const parsedName = args.name
            .replace(/\s+/g, "-")
            .toLowerCase();

        //creating the channels
        const channelId = await ctx.db.insert("channels", {
            name:parsedName,
            workspaceId: args.workspaceId,
        });
        return channelId;
    },
});

export const getById = query({
    args: {
        id: v.id("channels")
    },
    handler: async(ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            return null;
        }

        //fetch the channel
        const channel = await ctx.db.get(args.id);

        if(!channel){
            return null;
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
            )
            .unique();
        
        if(!member){
            return null;
        }

        return channel;
    },
});

export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            return[];
        }
        const member = await ctx.db
            //grabbing member for the database
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId).eq("userId", userId),
            )
            //get the unique member
            .unique();
        //if there's no member return an empty array
        if(!member){
            return [];
        }
        
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) =>
                q.eq("workspaceId", args.workspaceId),
            )
            .collect();
            
        return channels;
    },
});