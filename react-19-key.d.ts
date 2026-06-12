import 'react';

declare module 'react' {
  interface Attributes {
    key?: React.Key | null;
  }
}
