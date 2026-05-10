import nodemailer from 'nodemailer';

let transporter;

const placeholderPattern = /replace_with|your_|example|changeme/i;

const hasRealValue = (value = '') =>
  Boolean(String(value).trim()) && !placeholderPattern.test(String(value).trim());

export const getEmailConfigStatus = () => {
  const fields = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM
  };

  const missingFields = Object.entries(fields)
    .filter(([, value]) => !hasRealValue(value))
    .map(([name]) => name);

  return {
    configured: missingFields.length === 0,
    missingFields
  };
};

const hasSmtpConfig = () => getEmailConfigStatus().configured;

const getTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return transporter;
};

const categoryMessages = {
  study: {
    icon: '\u{1F4DA}',
    label: 'study session',
    body: 'A focused block now can make the rest of your day feel lighter.'
  },
  meditation: {
    icon: '\u{1F9D8}',
    label: 'meditation session',
    body: 'Taking a few minutes to relax your mind can improve focus, reduce stress, and boost mental health.'
  },
  workout: {
    icon: '\u{1F3C3}',
    label: 'workout session',
    body: 'Move gently, breathe steadily, and listen to your body.'
  },
  sleep: {
    icon: '\u{1F319}',
    label: 'sleep preparation',
    body: 'Dim the lights, slow down, and give your mind permission to rest.'
  },
  medication: {
    icon: '\u{1F48A}',
    label: 'medication reminder',
    body: 'Please follow your prescribed care plan.'
  },
  water: {
    icon: '\u{1F4A7}',
    label: 'water break',
    body: 'Small hydration breaks help your body and brain stay steady.'
  },
  mood: {
    icon: '\u{1F499}',
    label: 'mood check-in',
    body: 'Naming what you feel is a powerful step toward care.'
  },
  therapy: {
    icon: '\u{1F91D}',
    label: 'therapy session',
    body: 'Give yourself a calm moment before you begin.'
  },
  affirmation: {
    icon: '\u{2728}',
    label: 'daily affirmation',
    body: 'Speak to yourself with patience and kindness.'
  },
  breathing: {
    icon: '\u{1F32C}\uFE0F',
    label: 'breathing exercise',
    body: 'Slow breaths can help your nervous system settle.'
  },
  journal: {
    icon: '\u{1F4DD}',
    label: 'journal session',
    body: 'A few honest lines can clear mental clutter.'
  },
  other: {
    icon: '\u{1F514}',
    label: 'scheduled wellness activity',
    body: 'This small step is part of caring for your day.'
  }
};

const clockIcon = '\u23F0';
const heartIcon = '\u{1F499}';

const formatSlot = (item) => (item.endTime ? `${item.time} - ${item.endTime}` : item.time);

const formatDisplayTime = (time = '') => {
  const [hourRaw, minute] = time.split(':');
  const hour = Number(hourRaw);

  if (!Number.isInteger(hour) || !minute) {
    return time;
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
};

const formatDisplaySlot = (item) =>
  item.endTime
    ? `${formatDisplayTime(item.time)} - ${formatDisplayTime(item.endTime)}`
    : formatDisplayTime(item.time);

export const sendReminderEmail = async ({ to, name, item }) => {
  const transport = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'MindCare AI <no-reply@mindcare.ai>';
  const scheduledTime = formatDisplaySlot(item);
  const message = categoryMessages[item.category] || categoryMessages.other;
  const subject = `MindCare AI reminder: ${item.title}`;
  const text = [
    `Hello ${name || 'there'},`,
    '',
    `${message.icon} It's time for your ${message.label}.`,
    '',
    message.body,
    '',
    item.workingProblem ? `Working Problem: ${item.workingProblem}` : '',
    `Activity: ${item.title}`,
    item.note ? `Note: ${item.note}` : '',
    `${clockIcon} Scheduled Time: ${scheduledTime}`,
    '',
    `Stay positive and take care of yourself ${heartIcon}`,
    '',
    '- MindCare AI'
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <p>Hello ${name || 'there'},</p>
      <p style="font-size:18px;margin:18px 0 8px"><strong>${message.icon} It's time for your ${message.label}.</strong></p>
      <p>${message.body}</p>
      ${item.workingProblem ? `<p><strong>Working Problem:</strong> ${item.workingProblem}</p>` : ''}
      <p><strong>Activity:</strong> ${item.title}</p>
      ${item.note ? `<p><strong>Note:</strong> ${item.note}</p>` : ''}
      <p><strong>${clockIcon} Scheduled Time:</strong> ${scheduledTime}</p>
      <p>Stay positive and take care of yourself ${heartIcon}</p>
      <p>- MindCare AI</p>
    </div>
  `;

  if (!transport) {
    console.log(`[Reminder email skipped: SMTP not configured] ${to} - ${subject}`);
    return { skipped: true };
  }

  return transport.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};

export const sendTimetableSummaryEmail = async ({ to, name, items }) => {
  const transport = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'MindCare AI <no-reply@mindcare.ai>';
  const activeItems = items.filter((item) => item.active);
  const subject = 'Your MindCare AI daily timetable';
  const rows = activeItems.length ? activeItems : items;

  const textRows = rows.map((item, index) =>
    [
      `${index + 1}. ${item.title}`,
      `Time Slot: ${formatSlot(item)}`,
      `Category: ${item.category}`,
      item.workingProblem ? `Working Problem: ${item.workingProblem}` : '',
      item.note ? `Note: ${item.note}` : ''
    ].filter(Boolean).join('\n')
  );

  const text = [
    `Hello ${name || 'there'},`,
    '',
    'Here are your MindCare AI timetable details for your routine.',
    '',
    textRows.length ? textRows.join('\n\n') : 'No timetable items have been created yet.',
    '',
    'You will receive automatic emails at each enabled activity time when SMTP is configured.',
    '',
    '- MindCare AI'
  ].join('\n');

  const htmlRows = rows.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0"><strong>${item.title}</strong><br><span style="color:#64748b">${item.category}</span></td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">${formatSlot(item)}</td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">${item.workingProblem || 'Routine wellness task'}</td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0">${item.note || '-'}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="color:#0ea5e9;margin-bottom:8px">Your MindCare AI Timetable</h2>
      <p>Hello ${name || 'there'},</p>
      <p>Here are your timetable details for your daily routine.</p>
      ${rows.length ? `
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <thead>
            <tr style="background:#f8fafc;text-align:left">
              <th style="padding:12px">Activity</th>
              <th style="padding:12px">Time Slot</th>
              <th style="padding:12px">Working Problem</th>
              <th style="padding:12px">Note</th>
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
      ` : '<p>No timetable items have been created yet.</p>'}
      <p>You will receive automatic emails at each enabled activity time when SMTP is configured.</p>
      <p>- MindCare AI</p>
    </div>
  `;

  if (!transport) {
    console.log(`[Timetable summary email skipped: SMTP not configured] ${to} - ${subject}`);
    return { skipped: true };
  }

  return transport.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};
