/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { PostInputType, PostType, UserEntity, UserInputType, UserType } from './types.js';
import { FastifyInstance } from 'fastify';

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
  resolve: async (
    _source: any,
    args: { data: Omit<UserEntity, 'id'> },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.user.create(args);
  },
};

const createPost = {
  type: PostType,
  args: {
    data: { type: new GraphQLNonNull(PostInputType) },
  },
  resolve: async (
    _source: any,
    args: { data: { title: string; content: string; authorId: string } },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.post.create(args);
  },
};
