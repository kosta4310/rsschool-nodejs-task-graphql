import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import DataLoader from 'dataloader';
import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';

export type DataloadersType = {
  userDataloader: DataLoader<unknown, unknown, unknown>;
  postDataloader: DataLoader<unknown, unknown, unknown>;
  profileDataloader: DataLoader<unknown, unknown, unknown>;
  memberTypesDataloader: DataLoader<unknown, unknown, unknown>;
};
export function getDataloaders(
  fastify: FastifyInstance<
    RawServerDefault,
    IncomingMessage,
    ServerResponse<IncomingMessage>,
    FastifyBaseLogger,
    TypeBoxTypeProvider
  >,
) {
  async function userBatchFunction(keys: unknown) {
    const results = await fastify.prisma.user.findMany({
      where: { id: { in: keys as Array<string> } },
    });

    return (keys as Array<string>).map((key) => results.find((user) => user.id === key));
  }

  async function postBatchFunction(userIds: unknown) {
    const results = await fastify.prisma.post.findMany({
      where: { authorId: { in: userIds as Array<string> } },
    });

    return (userIds as Array<string>).map((userId) =>
      results.filter(({ authorId }) => authorId === userId),
    );
  }

  async function profileBatchFunction(userIds: unknown) {
    const results = await fastify.prisma.profile.findMany({
      where: { userId: { in: userIds as Array<string> } },
    });
    return (userIds as Array<string>).map((key) =>
      results.find((profile) => profile.userId === key),
    );
  }

  async function memberTypesBatchFunction(memberTypesIds: unknown) {
    const results = await fastify.prisma.memberType.findMany({
      where: { id: { in: memberTypesIds as Array<string> } },
    });
    return (memberTypesIds as Array<string>).map((key) =>
      results.find((memberType) => memberType.id === key),
    );
  }

  const userDataloader = new DataLoader(userBatchFunction);
  const postDataloader = new DataLoader(postBatchFunction);
  const profileDataloader = new DataLoader(profileBatchFunction);
  const memberTypesDataloader = new DataLoader(memberTypesBatchFunction);

  const dataloaders: DataloadersType = {
    userDataloader,
    postDataloader,
    profileDataloader,
    memberTypesDataloader,
  };

  return dataloaders;
}
