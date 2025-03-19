import { Context, Schema, segment, Quester } from 'koishi'

export const name = 'httpcat'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

// 添加HTTP状态码集合
const httpStatusCodes: number[] = [
  100, 101, 102, 103,
  200, 201, 202, 203, 204, 205, 206, 207, 208, 214, 226,
  300, 301, 302, 303, 304, 305, 307, 308,
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409,
  410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421,
  422, 423, 424, 425, 426, 428, 429, 431, 444, 450, 451,
  495, 496, 497, 498, 499,
  500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511,
  521, 522, 523, 525, 530, 599
];

function apply(ctx: Context) {
  ctx.i18n.define('zh', {
    'httpcat.invalid': '状态码 {0} 不存在。'
  });

  ctx.middleware(async (session, next) => {
    const message = session.content.trim();
    if (!/^\d{3}$/.test(message)) return next();

    const code = parseInt(message, 10);
    // 修改判断逻辑：使用集合代替数值范围判断
    if (!httpStatusCodes.includes(code)) return next();

    const url = `https://http.cat/${code}`;
    try {
      await ctx.http.head(url);
    } catch (error) {
      if (error instanceof Error && 'response' in error && (error.response as any)?.status === 404) {
        await session.send(session.text('httpcat.invalid', [code]));
        return;
      }
    }
    await session.send(segment.image(url));
  });
}

export { apply }
