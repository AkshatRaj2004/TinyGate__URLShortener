const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const AppError = require('../utils/AppError');
const parseUserAgent = require('../utils/parseUserAgent');

// ── POST /api/url/shorten ─────────────────────────────────────────────────────
const shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    // Resolve short code: prefer custom alias, else generate
    let shortCode = customAlias ? customAlias.toLowerCase() : nanoid(7);

    // Ensure custom alias is not already taken
    if (customAlias) {
      const exists = await Url.findOne({ shortCode });
      if (exists) {
        return next(new AppError('This custom alias is already taken. Please choose another.', 409));
      }
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || undefined,
      user: req.user._id,
      expiresAt: expiresAt || null,
    });

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    res.status(201).json({
      success: true,
      message: 'URL shortened successfully.',
      data: {
        _id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl,
        expiresAt: url.expiresAt,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /:shortCode (redirect) ────────────────────────────────────────────────
const redirectToOriginal = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });
    if (!url) {
      return next(new AppError('Short URL not found or has expired.', 404));
    }

    // ── Collect analytics asynchronously (fire-and-forget) ──────────────────
    const ua = parseUserAgent(req.headers['user-agent']);
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    setImmediate(async () => {
      try {
        await Url.findByIdAndUpdate(url._id, {
          $inc: { clicks: 1 },
          $push: {
            analytics: {
              ip,
              browser: ua.browser,
              os: ua.os,
              device: ua.device,
              referrer: req.headers['referer'] || 'direct',
              timestamp: new Date(),
            },
          },
        });
      } catch (_) {
        // Analytics failure should never break the redirect
      }
    });

    return res.redirect(301, url.originalUrl);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/url/all ──────────────────────────────────────────────────────────
const getAllUrls = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-analytics'),
      Url.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: urls.map((u) => ({
        ...u.toObject(),
        shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/url/:id ───────────────────────────────────────────────────────
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return next(new AppError('URL not found or you are not authorised to delete it.', 404));
    }

    await url.deleteOne();

    res.status(200).json({
      success: true,
      message: 'URL deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/url/analytics/:id ────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return next(new AppError('URL not found or you are not authorised to view its analytics.', 404));
    }

    // ── Aggregate analytics ────────────────────────────────────────────────
    const clicksOverTime = url.analytics.reduce((acc, click) => {
      const date = new Date(click.timestamp).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const byBrowser = url.analytics.reduce((acc, { browser }) => {
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    const byDevice = url.analytics.reduce((acc, { device }) => {
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const byOs = url.analytics.reduce((acc, { os }) => {
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        _id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        totalClicks: url.clicks,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        clicksOverTime,
        byBrowser,
        byDevice,
        byOs,
        recentClicks: url.analytics.slice(-20).reverse(),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  shortenUrl,
  redirectToOriginal,
  getAllUrls,
  deleteUrl,
  getAnalytics,
};
