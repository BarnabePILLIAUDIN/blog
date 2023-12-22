import auth from "@/api/middlewares/auth"
import validate from "@/api/middlewares/validate"
import mw from "@/api/mw"
import sanitizePosts from "@/api/utils/sanitizePosts"
import {
  contentValidator,
  idValidator,
  titleValidator,
  tokenValidator,
} from "@/utils/validator"

const handler = mw({
  GET: [
    validate({
      query: {
        postId: idValidator.required(),
      },
    }),
    async ({
      send,
      input: {
        query: { postId },
      },
      models: { PostModel },
    }) => {
      const post = await PostModel.query()
        .findById(postId)
        .withGraphFetched("[comments,user]")
        .throwIfNotFound()
      const sanitizedPost = sanitizePosts([post])

      send(sanitizedPost, { count: 1 })
    },
  ],
  PATCH: [
    validate({
      query: {
        postId: idValidator.required(),
      },
      body: {
        title: titleValidator,
        content: contentValidator,
        token: tokenValidator,
      },
    }),
    auth(),
    async ({
      send,
      input: {
        query: { postId },
        body,
      },
      models: { PostModel },
    }) => {
      const { token: _token, ...sanitizedBody } = body
      const updatedPost = await PostModel.query()
        .updateAndFetchById(postId, {
          ...sanitizedBody,
        })
        .withGraphFetched("[comments,user]")
        .throwIfNotFound()
      const sanitizedPost = sanitizePosts([updatedPost])
      send(sanitizedPost, { count: 1 })
    },
  ],
  DELETE: [
    validate({
      query: {
        postId: idValidator.required(),
      },
    }),
    async ({
      models: { PostModel },
      send,
      input: {
        query: { postId },
      },
    }) => {
      const deletedUser = await PostModel.query()
        .deleteById(postId)
        .throwIfNotFound()
      send(deletedUser)
    },
  ],
})

export default handler