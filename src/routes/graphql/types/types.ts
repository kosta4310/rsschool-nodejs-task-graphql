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
import { UUIDType } from './uuid.js';
import { DataloadersType } from '../utilites/getDataloaders.js';

type User = UserEntity & {
  userSubscribedTo: Array<{ subscriberId: string; authorId: string }>;
  subscribedToUser: Array<{ subscriberId: string; authorId: string }>;
};

export type PostEntity = { id: string; title: string; content: string; authorId: string };
export type UserEntity = { id: string; balance: number; name: string };
export type ProfileEntity = {
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

export type ContextValue = {
  fastify: FastifyInstance;
  dataloaders: DataloadersType;
};
type SubscribersOnAuthorsEntity = { subscriberId: string; authorId: string };

export const MemberTypeIdType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

// Models

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: GraphQLString },
    id: { type: new GraphQLNonNull(GraphQLID) },
    balance: { type: GraphQLFloat },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        { id }: UserEntity,
        _args: unknown,
        { dataloaders }: ContextValue,
      ) => {
        return await dataloaders.postDataloader.load(id);
      },
    },
    profile: {
      type: ProfileType,
      resolve: async (
        { id }: UserEntity,
        _args: unknown,
        { dataloaders }: ContextValue,
      ) => {
        return await dataloaders.profileDataloader.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (
        { id }: UserEntity,
        _args: unknown,
        { dataloaders }: ContextValue,
      ) => {
        const user = (await dataloaders.userDataloader.load(id)) as User;

        const arrayUserSubTo = user.userSubscribedTo.map((item) => {
          return dataloaders.userDataloader.load(item.authorId);
        });

        const res = await Promise.all(arrayUserSubTo);

        return res;
      },
    },

    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (
        { id }: UserEntity,
        _args: unknown,
        { dataloaders }: ContextValue,
      ) => {
        const user = (await dataloaders.userDataloader.load(id)) as User;

        const arraySubToUser = user.subscribedToUser.map((item) => {
          return dataloaders.userDataloader.load(item.subscriberId);
        });

        const res = await Promise.all(arraySubToUser);

        return res;
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
        _args: unknown,
        { fastify: { prisma } }: ContextValue,
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
        { fastify: { prisma } }: ContextValue,
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
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
    user: {
      type: UserType,
      resolve: async (
        { userId }: ProfileEntity,
        _args: unknown,
        { dataloaders }: ContextValue,
      ) => {
        return await dataloaders.userDataloader.load(userId);
      },
    },
    memberType: {
      type: MemberTypeType,
      resolve: async (
        { memberTypeId }: ProfileEntity,
        _args: unknown,
        { dataloaders }: ContextValue,
      ) => {
        return await dataloaders.memberTypesDataloader.load(memberTypeId);
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
        _args: unknown,
        { fastify: { prisma } }: ContextValue,
      ) => {
        return await prisma.user.findUnique({ where: { id: subscriberId } });
      },
    },
    author: {
      type: UserType,
      resolve: async (
        { authorId }: SubscribersOnAuthorsEntity,
        _args: unknown,
        { fastify: { prisma } }: ContextValue,
      ) => {
        return await prisma.user.findUnique({ where: { id: authorId } });
      },
    },
  }),
});

// input types

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  }),
});

export const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
  }),
});

export const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

export const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdType },
  }),
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});
