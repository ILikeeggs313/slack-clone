import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);

};

export const get = query({
  args: {workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx); 
      
      if(!userId){
        //we do not throw error in query, only in mutation
        return null;
      }
      const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", args.workspaceId).eq("userId", userId)
        )
        .unique();
    
    if(!member){
        return [];
    }

    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

      const members = [];

      for(const member of data){
        //for each member, attempt to pop the user they connect to
        const user = await populateUser(ctx, member.userId);

        if(user) {
          //if there's a user, we load it
          members.push({
            ...member,
            user,
          });
        }
      }
      
      return members;
  },
});

export const current = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
      const userId = await auth.getUserId(ctx); 
      
      if(!userId){
        //we do not throw error in query, only in mutation
        return null;
      }
      const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", args.workspaceId).eq("userId", userId)
        )
        .unique();
    
    if(!member){
        return null;
    }

    return member;
    },
});