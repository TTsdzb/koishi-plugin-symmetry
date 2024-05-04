import { Context, Schema, h } from "koishi";
import {} from "koishi-plugin-canvas";

export const name = "symmetry";
export const inject = ["canvas", "http"];

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

async function generate(ctx: Context, imageUrl: string) {
  const image = await ctx.canvas.loadImage(imageUrl);
  const canvas = await ctx.canvas.createCanvas(
    image.naturalWidth,
    image.naturalHeight
  );
  const canvasCtx = canvas.getContext("2d");

  canvasCtx.drawImage(image, 0, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.drawImage(
    image,
    0,
    0,
    0.5 * image.naturalWidth,
    image.naturalHeight,
    -image.naturalWidth,
    0,
    image.naturalWidth / 2,
    image.naturalHeight
  );

  return (
    <>
      <img src={await canvas.toDataURL("image/png")} />
    </>
  );
}

export function apply(ctx: Context) {
  // Register i18n
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));

  // Register the command
  ctx.command("symmetry [image:text]").action(async ({ session }, image) => {
    const [argCode] = h.select(image || [], "img");

    if (argCode && argCode.attrs.src)
      return await generate(ctx, argCode.attrs.src);

    await session.send(
      <>
        {session.channel ? (
          <>
            <at id={session.userId} />{" "}
          </>
        ) : (
          ""
        )}
        <i18n path=".pleaseSendImage" />
      </>
    );
    const [resCode] = h.select((await session.prompt()) || [], "img");
    if (resCode && resCode.attrs.src)
      return await generate(ctx, resCode.attrs.src);

    return (
      <>
        {session.channel ? (
          <>
            <at id={session.userId} />{" "}
          </>
        ) : (
          ""
        )}
        <i18n path=".jobCanceled" />
      </>
    );
  });
}
