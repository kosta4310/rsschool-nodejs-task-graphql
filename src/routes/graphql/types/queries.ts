/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import {
  ContextValue,
  MemberTypeIdType,
  MemberTypeType,
  PostType,
  ProfileType,
  UserType,
} from './types.js';
import { FastifyInstance } from 'fastify';
import { UUIDType } from './uuid.js';
import { MemberTypeId } from '../../member-types/schemas.js';

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users,
    user,
    posts,
    post,
    memberTypes,
    memberType,
    profiles,
    profile,
  }),
});

const users = {
  type: new GraphQLList(UserType),
  resolve: async (
    _source: unknown,
    _args: unknown,
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.user.findMany();
  },
};

const user = {
  type: UserType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: string },
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.user.findUnique({ where: { id } });
  },
};

const posts = {
  type: new GraphQLList(PostType),
  resolve: async (
    _source: unknown,
    args: unknown,
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.post.findMany();
  },
};

const post = {
  type: PostType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: string },
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.post.findUnique({ where: { id } });
  },
};

const memberTypes = {
  type: new GraphQLList(MemberTypeType),
  resolve: async (
    _source: unknown,
    _args: unknown,
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.memberType.findMany();
  },
};

const memberType = {
  type: MemberTypeType,
  args: { id: { type: new GraphQLNonNull(MemberTypeIdType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: MemberTypeId },
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.memberType.findUnique({ where: { id } });
  },
};

const profiles = {
  type: new GraphQLList(ProfileType),
  resolve: async (
    _source: unknown,
    args: unknown,
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.profile.findMany();
  },
};

const profile = {
  type: ProfileType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    _source: unknown,
    { id }: { id: string },
    { fastify: { prisma } }: ContextValue,
  ) => {
    return await prisma.profile.findUnique({ where: { id } });
  },
};
