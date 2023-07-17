/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyInstance } from 'fastify/types/instance.js';
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { MemberTypeId } from '../../member-types/schemas.js';
type PostEntity = { id: string; title: string; content: string; authorId: string };
export type UserEntity = { id: string; balance: number; name: string };
type ProfileEntity = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: MemberTypeId;
  userId: string;
};
type MemberTypeEntity = {
  id: MemberTypeId;
  discount: number;
  postsLimitPerMonth: number;
};
// export enum MemberTypeId {
//   BASIC = 'basic',
//   BUSINESS = 'business',
// }
type SubscribersOnAuthorsEntity = { subscriberId: string; authorId: string };

export const MemberTypeIdType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: GraphQLString },
    id: { type: new GraphQLNonNull(GraphQLID) },
    balance: { type: GraphQLFloat },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async ({ id }: UserEntity, _args: any, { prisma }: FastifyInstance) => {
        return await prisma.post.findMany({ where: { authorId: id } });
      },
    },
    profile: {
      type: ProfileType,
      resolve: async ({ id }: UserEntity, _args: any, { prisma }: FastifyInstance) => {
        return await prisma.profile.findUnique({ where: { userId: id } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: UserEntity, _args: any, { prisma }: FastifyInstance) => {
        const array = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: id },
        });
        const arr = array.map(
          (item) => item.authorId,
        ); /*массив ID авторов, на которых подписан юзер*/
        return await prisma.user.findMany({ where: { id: { in: arr } } });
      },
    },

    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: UserEntity, _args: any, { prisma }: FastifyInstance) => {
        const array = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: id },
        });
        const arr = array.map(
          (item) => item.subscriberId,
        ); /*массив ID подписчиков на юзера*/
        return await prisma.user.findMany({ where: { id: { in: arr } } });
      },
    },
  }),
});

export const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeIdType },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (
        { id }: MemberTypeEntity,
        _args: any,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.profile.findMany({ where: { memberTypeId: id } });
      },
    },
  }),
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
    author: {
      type: UserType,
      resolve: async (
        { authorId }: PostEntity,
        _args: Omit<PostEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: authorId } });
      },
    },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberTypeId: { type: MemberTypeIdType },
    user: {
      type: UserType,
      resolve: async (
        { userId }: ProfileEntity,
        _args: any,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: userId } });
      },
    },
    memberType: {
      type: MemberTypeType,
      resolve: async (
        { memberTypeId }: ProfileEntity,
        _args: any,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.memberType.findUnique({ where: { id: memberTypeId } });
      },
    },
  }),
});

const SubscribersOnAuthorsType = new GraphQLObjectType({
  name: 'SubscribersOnAuthors',
  fields: () => ({
    subscriberId: { type: GraphQLID },
    authorId: { type: GraphQLID },
    subscriber: {
      type: UserType,
      resolve: async (
        { subscriberId }: SubscribersOnAuthorsEntity,
        _args: any,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: subscriberId } });
      },
    },
    author: {
      type: UserType,
      resolve: async (
        { authorId }: SubscribersOnAuthorsEntity,
        _args: any,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: authorId } });
      },
    },
  }),
});

// input types

export const UserInputType = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const PostInputType = new GraphQLInputObjectType({
  name: 'PostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
  }),
});
