/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { PostInputType, UserInputType, UserType } from './types.js';
import { FastifyInstance } from 'fastify/types/instance.js';

export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUser,
    createPost,
  }),
});

const createUser = {
  type: UserType,
  args: {
    data: { type: new GraphQLNonNull(UserInputType) },
  },
  resolve: async (_source: any, args: any, { prisma }: FastifyInstance) => {
    return await prisma.user.create(args);
  },
};

const createPost = {
  type: 'PostType',
  args: {
    data: { type: new GraphQLNonNull(PostInputType) },
  },
  resolve: async (source: any, args: any, { prisma }: FastifyInstance) => {
    return await prisma.post.create(args);
  },
};
