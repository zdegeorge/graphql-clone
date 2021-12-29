declare global { declare namespace Schema {
type Maybe<T> = T | undefined;
type InputMaybe<T> = T | undefined;
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: any;
  Byte: any;
  Currency: any;
  DID: any;
  Date: Date;
  DateTime: any;
  Duration: any;
  EmailAddress: any;
  GUID: any;
  HSL: any;
  HSLA: any;
  HexColorCode: any;
  Hexadecimal: any;
  IBAN: any;
  IPv4: any;
  IPv6: any;
  ISBN: any;
  ISO8601Duration: any;
  JSON: any;
  JSONObject: any;
  JWT: any;
  Latitude: any;
  LocalDate: any;
  LocalEndTime: any;
  LocalTime: any;
  Long: any;
  Longitude: any;
  MAC: any;
  NegativeFloat: any;
  NegativeInt: any;
  NonEmptyString: any;
  NonNegativeFloat: any;
  NonNegativeInt: any;
  NonPositiveFloat: any;
  NonPositiveInt: any;
  ObjectID: any;
  PhoneNumber: any;
  Port: any;
  PositiveFloat: any;
  PositiveInt: any;
  PostalCode: any;
  RGB: any;
  RGBA: any;
  SafeInt: any;
  Time: any;
  Timestamp: any;
  URL: any;
  USCurrency: any;
  UUID: any;
  UnsignedFloat: any;
  UnsignedInt: any;
  UtcOffset: any;
  Void: any;
};

type AuthenticateAdminInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

type AuthenticateVisitorInput = {
  userid: Scalars['String'];
};

type Entry = {
  __typename?: 'Entry';
  content?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  user: User;
  user_id: Scalars['ID'];
};

type Mutation = {
  __typename?: 'Mutation';
  createEntry: Entry;
  createSubject: Subject;
  createUser: User;
};


type MutationCreateEntryArgs = {
  content?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  userId: Scalars['Int'];
};


type MutationCreateSubjectArgs = {
  extension?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};


type MutationCreateUserArgs = {
  image_url?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

type Permission =
  | 'INVALID_PERMISSION'
  | 'VALID_PERMISSION';

type Query = {
  __typename?: 'Query';
  entries?: Maybe<Array<Maybe<Entry>>>;
  entry?: Maybe<Entry>;
  session?: Maybe<Session>;
  sessions?: Maybe<Array<Maybe<Session>>>;
  subject?: Maybe<Subject>;
  subjects: Array<Maybe<Subject>>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};


type QueryEntryArgs = {
  id: Scalars['ID'];
};


type QuerySessionArgs = {
  id: Scalars['ID'];
};


type QuerySubjectArgs = {
  id: Scalars['ID'];
};


type QueryUserArgs = {
  id: Scalars['ID'];
};

type Session = {
  __typename?: 'Session';
  admin: Scalars['Boolean'];
  authenticated: Scalars['Boolean'];
  id: Scalars['ID'];
  type: SessionType;
  user?: Maybe<User>;
};

type SessionType =
  | 'ADMIN'
  | 'APP_LOUNGE'
  | 'APP_USER'
  | 'VISITOR';

type Subject = {
  __typename?: 'Subject';
  created_at?: Maybe<Scalars['String']>;
  extension?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
};

type Subscription = {
  __typename?: 'Subscription';
  newEntry: Entry;
  newSubject: Subject;
};

type User = {
  __typename?: 'User';
  admin: Scalars['Boolean'];
  created_at?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  image_url?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  username: Scalars['String'];
};

} } export {};