import type messages from '../messages/en.json';

// Message keys are type-checked against the English catalogue; uz/ru must mirror its shape.
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}
