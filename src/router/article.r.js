const router = require("koa-router");

const route = new router();
const MArticle = model.getModel("article");

/**
 * 获取文章信息
 * 0 - 获取成功
 * 1 - 参数缺失
 * 2 - 获取文章失败
 * 3 - 文章不存在
 */
route.get("/article", async ctx => {
	const { id } = ctx.params;

	if (!id) {
		return (ctx.body = {
			code: 1,
			msg: "参数缺失"
		});
  }
  
  let articleRes;
	try {
		articleRes = await MArticle.findById(id);
		if (!articleRes) {
			return (ctx.body = {
				code: 3,
				msg: "文章不存在"
			});
		}
	} catch (e) {
		return (ctx.body = {
			code: 2,
			msg: "获取文章失败"
		});
	}

	ctx.body = {
		code: 0,
		msg: "文章获取成功",
		data: articleRes
	};
});

/**
 * 添加文章
 * 0 - 添加成功
 * 1 - 参数缺失
 */
route.post("/article", async ctx => {
	const { body } = ctx.request;
	const info = {};

	// 所需参数
	// TODO: 可优化
	const { name, author, press, tag, desc, catalog } = body;
	if (!(name && author && press && desc && tag && catalog)) {
		return (ctx.body = { code: 1, msg: "参数缺失" });
	}

	// 获取书籍 md5 信息
	const bookMd5 = file.getFileMd5(book.path);

	// 非必要书籍属性的默认值
	// TODO: 书名过滤后缀
	const defBookInfo = {
		name: book.name.replace(/.epub$/, ""),
		md5: bookMd5
	};

	// 书籍封面文件存储
	const coverName = await file.commonFileSave(
		cover,
		path.join(env.put, "/book/cover")
	);
	info.cover = `${env.get}/book/cover/${coverName}`;

	// 书籍本体存储
	// 若书籍存在则不进行存储操作 直接使用文件
	// TODO: 同一用户重复上传
	const findBookRes = await MBook.findOne({ md5: bookMd5 });

	if (!findBookRes) {
		const bookName = await file.commonFileSave(
			book,
			path.join(env.put, "/book")
		);
		info.path = `${env.get}/book/${bookName}`;
	} else {
		info.path = findBookRes.path;
	}

	// 数据库存储处理
	const bookInfo = Object.assign({}, info, defBookInfo);
	await MBook.create(bookInfo);

	ctx.body = { code: 0, msg: "书籍上传成功" };
});

module.exports = route;