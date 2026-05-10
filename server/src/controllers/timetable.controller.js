import { TimetableItem } from '../models/timetable.model.js';
import { getEmailConfigStatus, sendTimetableSummaryEmail } from '../utils/email.service.js';

const allowedFields = [
  'title',
  'category',
  'time',
  'endTime',
  'timezone',
  'daysOfWeek',
  'note',
  'workingProblem',
  'reminderEnabled',
  'active'
];

const pickAllowedFields = (body) =>
  allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});

export const listTimetableItems = async (req, res, next) => {
  try {
    const items = await TimetableItem.find({ userId: req.user._id }).sort({ time: 1, createdAt: -1 });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const createTimetableItem = async (req, res, next) => {
  try {
    const payload = {
      ...pickAllowedFields(req.body),
      userId: req.user._id,
      userEmail: req.user.email
    };

    const item = await TimetableItem.create(payload);

    res.status(201).json({
      success: true,
      message: 'Timetable item created',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const updateTimetableItem = async (req, res, next) => {
  try {
    const item = await TimetableItem.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      pickAllowedFields(req.body),
      {
        new: true,
        runValidators: true
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Timetable item not found'
      });
    }

    res.json({
      success: true,
      message: 'Timetable item updated',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTimetableItem = async (req, res, next) => {
  try {
    const item = await TimetableItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Timetable item not found'
      });
    }

    res.json({
      success: true,
      message: 'Timetable item deleted'
    });
  } catch (error) {
    next(error);
  }
};

export const logTimetableStatus = async (req, res, next) => {
  try {
    const status = req.body.status === 'skipped' ? 'skipped' : 'completed';
    const item = await TimetableItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Timetable item not found'
      });
    }

    item.logs = [
      {
        status,
        note: req.body.note || ''
      },
      ...item.logs
    ].slice(0, 60);

    await item.save();

    res.json({
      success: true,
      message: `Timetable item marked ${status}`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const getTimetableSummary = async (req, res, next) => {
  try {
    const items = await TimetableItem.find({ userId: req.user._id });
    const total = items.length;
    const active = items.filter((item) => item.active).length;
    const remindersEnabled = items.filter((item) => item.reminderEnabled && item.active).length;
    const completed = items.reduce(
      (count, item) => count + item.logs.filter((log) => log.status === 'completed').length,
      0
    );
    const sent = items.reduce(
      (count, item) => count + item.logs.filter((log) => log.status === 'sent').length,
      0
    );

    res.json({
      success: true,
      data: {
        total,
        active,
        remindersEnabled,
        completed,
        sent
      }
    });
  } catch (error) {
    next(error);
  }
};

export const emailTimetableSummary = async (req, res, next) => {
  try {
    const items = await TimetableItem.find({ userId: req.user._id }).sort({ time: 1, createdAt: -1 });

    const result = await sendTimetableSummaryEmail({
      to: req.user.email,
      name: req.user.name,
      items
    });

    res.json({
      success: true,
      message: result?.skipped
        ? 'Timetable email is ready, but SMTP is not configured yet.'
        : `Timetable details shared to ${req.user.email}`
    });
  } catch (error) {
    next(error);
  }
};

export const getTimetableEmailStatus = async (req, res, next) => {
  try {
    const status = getEmailConfigStatus();

    res.json({
      success: true,
      data: {
        smtpConfigured: status.configured,
        missingFields: status.missingFields,
        recipientEmail: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};
