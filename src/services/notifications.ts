import * as Notifications from 'expo-notifications';
import { MorphCategory } from '../constants/categories';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

interface MilestoneMessages {
  start: string;
  quarter: string;
  half: string;
  threeQuarter: string;
  sevenDays: string;
  goalDay: string;
  completed: string;
}

const startMessages: Record<MorphCategory, string> = {
  fitness: 'Your fitness journey has begun! 💪 Stay consistent.',
  health: 'Your health transformation starts now! ❤️ You\'ve got this.',
  style: 'Time for a style glow-up! ✂️ Let\'s see the change.',
  space: 'Your space makeover begins! 🏠 One step at a time.',
  plant: 'Your plant journey starts now! 🌱 Watch it grow.',
  project: 'Project started! 🔨 Let\'s build something amazing.',
  art: 'Your artistic transformation begins! 🎨 Create away.',
  other: 'Your transformation journey starts now! Let\'s do this.',
};

function getMessages(category: MorphCategory): MilestoneMessages {
  return {
    start: startMessages[category],
    quarter: '25% of the way there! Keep pushing forward. 🔥',
    half: 'You\'re halfway! The difference is already showing. 💫',
    threeQuarter: '75% done! Almost there — don\'t stop now. 🚀',
    sevenDays: '7 days left! Time to prepare for your after photo. 📸',
    goalDay: 'Today is the day. Open your camera. 🎯',
    completed: 'Transformation complete! Share your before/after with the world. 🏆',
  };
}

export async function scheduleMilestoneNotifications(
  morphId: string,
  morphTitle: string,
  category: MorphCategory,
  startDate: Date,
  goalDate: Date
): Promise<string[]> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];

  const messages = getMessages(category);
  const totalMs = goalDate.getTime() - startDate.getTime();
  const notificationIds: string[] = [];

  const milestones: { fraction: number; body: string }[] = [
    { fraction: 0, body: messages.start },
    { fraction: 0.25, body: messages.quarter },
    { fraction: 0.5, body: messages.half },
    { fraction: 0.75, body: messages.threeQuarter },
  ];

  for (const milestone of milestones) {
    const triggerDate = new Date(startDate.getTime() + totalMs * milestone.fraction);
    if (triggerDate.getTime() > Date.now()) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `MORPH — ${morphTitle}`,
            body: milestone.body,
            data: { morphId },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
        });
        notificationIds.push(id);
      } catch {}
    }
  }

  // 7 days before goal
  const sevenDaysBefore = new Date(goalDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (sevenDaysBefore.getTime() > Date.now()) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `MORPH — ${morphTitle}`,
          body: messages.sevenDays,
          data: { morphId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: sevenDaysBefore },
      });
      notificationIds.push(id);
    } catch {}
  }

  // Goal day
  if (goalDate.getTime() > Date.now()) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `MORPH — ${morphTitle}`,
          body: messages.goalDay,
          data: { morphId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: goalDate },
      });
      notificationIds.push(id);
    } catch {}
  }

  return notificationIds;
}

export async function cancelMorphNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}
