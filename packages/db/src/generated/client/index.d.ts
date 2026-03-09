
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * Application user. Auth source of truth is Clerk — synced via webhook.
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model SleeperProfile
 * Linked Sleeper account for a user.
 */
export type SleeperProfile = $Result.DefaultSelection<Prisma.$SleeperProfilePayload>
/**
 * Model UserPreferences
 * Per-user agent customization preferences.
 * These are injected into every agent run as system context.
 */
export type UserPreferences = $Result.DefaultSelection<Prisma.$UserPreferencesPayload>
/**
 * Model AgentRun
 * Record of every agent job execution.
 */
export type AgentRun = $Result.DefaultSelection<Prisma.$AgentRunPayload>
/**
 * Model TokenBudget
 * Monthly token + run usage tracking per user.
 */
export type TokenBudget = $Result.DefaultSelection<Prisma.$TokenBudgetPayload>
/**
 * Model AnalyticsEvent
 * Flexible event store for behavioral analytics and system telemetry.
 * Use track() helper — never insert directly.
 * See docs/DATA.md for full event type catalog.
 */
export type AnalyticsEvent = $Result.DefaultSelection<Prisma.$AnalyticsEventPayload>
/**
 * Model Player
 * All NFL players, refreshed daily from Sleeper /players/nfl.
 * Primary key is Sleeper's player_id string.
 */
export type Player = $Result.DefaultSelection<Prisma.$PlayerPayload>
/**
 * Model PlayerRanking
 * Consensus rankings from FantasyPros and other sources.
 * Updated weekly (Tuesday after MNF).
 */
export type PlayerRanking = $Result.DefaultSelection<Prisma.$PlayerRankingPayload>
/**
 * Model TrendingPlayer
 * Waiver wire trending data from Sleeper. Updated hourly.
 */
export type TrendingPlayer = $Result.DefaultSelection<Prisma.$TrendingPlayerPayload>
/**
 * Model ContentItem
 * Normalized content from all ingested sources.
 * Raw content preserved for reprocessing as extraction improves.
 */
export type ContentItem = $Result.DefaultSelection<Prisma.$ContentItemPayload>
/**
 * Model ContentSource
 * Registry of all content ingestion sources.
 */
export type ContentSource = $Result.DefaultSelection<Prisma.$ContentSourcePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserTier: {
  free: 'free',
  paid: 'paid'
};

export type UserTier = (typeof UserTier)[keyof typeof UserTier]


export const UserRole: {
  user: 'user',
  admin: 'admin'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const AgentRunStatus: {
  queued: 'queued',
  running: 'running',
  done: 'done',
  failed: 'failed'
};

export type AgentRunStatus = (typeof AgentRunStatus)[keyof typeof AgentRunStatus]


export const AgentResultRating: {
  up: 'up',
  down: 'down'
};

export type AgentResultRating = (typeof AgentResultRating)[keyof typeof AgentResultRating]


export const LeagueStyle: {
  redraft: 'redraft',
  keeper: 'keeper',
  dynasty: 'dynasty'
};

export type LeagueStyle = (typeof LeagueStyle)[keyof typeof LeagueStyle]


export const ScoringPriority: {
  ppr: 'ppr',
  half_ppr: 'half_ppr',
  standard: 'standard'
};

export type ScoringPriority = (typeof ScoringPriority)[keyof typeof ScoringPriority]


export const PlayStyle: {
  safe_floor: 'safe_floor',
  balanced: 'balanced',
  boom_bust: 'boom_bust'
};

export type PlayStyle = (typeof PlayStyle)[keyof typeof PlayStyle]


export const ReportFormat: {
  detailed: 'detailed',
  concise: 'concise'
};

export type ReportFormat = (typeof ReportFormat)[keyof typeof ReportFormat]


export const TrendingType: {
  add: 'add',
  drop: 'drop'
};

export type TrendingType = (typeof TrendingType)[keyof typeof TrendingType]

}

export type UserTier = $Enums.UserTier

export const UserTier: typeof $Enums.UserTier

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type AgentRunStatus = $Enums.AgentRunStatus

export const AgentRunStatus: typeof $Enums.AgentRunStatus

export type AgentResultRating = $Enums.AgentResultRating

export const AgentResultRating: typeof $Enums.AgentResultRating

export type LeagueStyle = $Enums.LeagueStyle

export const LeagueStyle: typeof $Enums.LeagueStyle

export type ScoringPriority = $Enums.ScoringPriority

export const ScoringPriority: typeof $Enums.ScoringPriority

export type PlayStyle = $Enums.PlayStyle

export const PlayStyle: typeof $Enums.PlayStyle

export type ReportFormat = $Enums.ReportFormat

export const ReportFormat: typeof $Enums.ReportFormat

export type TrendingType = $Enums.TrendingType

export const TrendingType: typeof $Enums.TrendingType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sleeperProfile`: Exposes CRUD operations for the **SleeperProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SleeperProfiles
    * const sleeperProfiles = await prisma.sleeperProfile.findMany()
    * ```
    */
  get sleeperProfile(): Prisma.SleeperProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userPreferences`: Exposes CRUD operations for the **UserPreferences** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserPreferences
    * const userPreferences = await prisma.userPreferences.findMany()
    * ```
    */
  get userPreferences(): Prisma.UserPreferencesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentRun`: Exposes CRUD operations for the **AgentRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentRuns
    * const agentRuns = await prisma.agentRun.findMany()
    * ```
    */
  get agentRun(): Prisma.AgentRunDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tokenBudget`: Exposes CRUD operations for the **TokenBudget** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TokenBudgets
    * const tokenBudgets = await prisma.tokenBudget.findMany()
    * ```
    */
  get tokenBudget(): Prisma.TokenBudgetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.analyticsEvent`: Exposes CRUD operations for the **AnalyticsEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AnalyticsEvents
    * const analyticsEvents = await prisma.analyticsEvent.findMany()
    * ```
    */
  get analyticsEvent(): Prisma.AnalyticsEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.player`: Exposes CRUD operations for the **Player** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Players
    * const players = await prisma.player.findMany()
    * ```
    */
  get player(): Prisma.PlayerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.playerRanking`: Exposes CRUD operations for the **PlayerRanking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlayerRankings
    * const playerRankings = await prisma.playerRanking.findMany()
    * ```
    */
  get playerRanking(): Prisma.PlayerRankingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trendingPlayer`: Exposes CRUD operations for the **TrendingPlayer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrendingPlayers
    * const trendingPlayers = await prisma.trendingPlayer.findMany()
    * ```
    */
  get trendingPlayer(): Prisma.TrendingPlayerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contentItem`: Exposes CRUD operations for the **ContentItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContentItems
    * const contentItems = await prisma.contentItem.findMany()
    * ```
    */
  get contentItem(): Prisma.ContentItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contentSource`: Exposes CRUD operations for the **ContentSource** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContentSources
    * const contentSources = await prisma.contentSource.findMany()
    * ```
    */
  get contentSource(): Prisma.ContentSourceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    SleeperProfile: 'SleeperProfile',
    UserPreferences: 'UserPreferences',
    AgentRun: 'AgentRun',
    TokenBudget: 'TokenBudget',
    AnalyticsEvent: 'AnalyticsEvent',
    Player: 'Player',
    PlayerRanking: 'PlayerRanking',
    TrendingPlayer: 'TrendingPlayer',
    ContentItem: 'ContentItem',
    ContentSource: 'ContentSource'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "sleeperProfile" | "userPreferences" | "agentRun" | "tokenBudget" | "analyticsEvent" | "player" | "playerRanking" | "trendingPlayer" | "contentItem" | "contentSource"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      SleeperProfile: {
        payload: Prisma.$SleeperProfilePayload<ExtArgs>
        fields: Prisma.SleeperProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SleeperProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SleeperProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>
          }
          findFirst: {
            args: Prisma.SleeperProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SleeperProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>
          }
          findMany: {
            args: Prisma.SleeperProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>[]
          }
          create: {
            args: Prisma.SleeperProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>
          }
          createMany: {
            args: Prisma.SleeperProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SleeperProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>[]
          }
          delete: {
            args: Prisma.SleeperProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>
          }
          update: {
            args: Prisma.SleeperProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>
          }
          deleteMany: {
            args: Prisma.SleeperProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SleeperProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SleeperProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>[]
          }
          upsert: {
            args: Prisma.SleeperProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SleeperProfilePayload>
          }
          aggregate: {
            args: Prisma.SleeperProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSleeperProfile>
          }
          groupBy: {
            args: Prisma.SleeperProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<SleeperProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.SleeperProfileCountArgs<ExtArgs>
            result: $Utils.Optional<SleeperProfileCountAggregateOutputType> | number
          }
        }
      }
      UserPreferences: {
        payload: Prisma.$UserPreferencesPayload<ExtArgs>
        fields: Prisma.UserPreferencesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserPreferencesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserPreferencesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          findFirst: {
            args: Prisma.UserPreferencesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserPreferencesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          findMany: {
            args: Prisma.UserPreferencesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>[]
          }
          create: {
            args: Prisma.UserPreferencesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          createMany: {
            args: Prisma.UserPreferencesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserPreferencesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>[]
          }
          delete: {
            args: Prisma.UserPreferencesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          update: {
            args: Prisma.UserPreferencesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          deleteMany: {
            args: Prisma.UserPreferencesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserPreferencesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserPreferencesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>[]
          }
          upsert: {
            args: Prisma.UserPreferencesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          aggregate: {
            args: Prisma.UserPreferencesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserPreferences>
          }
          groupBy: {
            args: Prisma.UserPreferencesGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserPreferencesGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserPreferencesCountArgs<ExtArgs>
            result: $Utils.Optional<UserPreferencesCountAggregateOutputType> | number
          }
        }
      }
      AgentRun: {
        payload: Prisma.$AgentRunPayload<ExtArgs>
        fields: Prisma.AgentRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findFirst: {
            args: Prisma.AgentRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findMany: {
            args: Prisma.AgentRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          create: {
            args: Prisma.AgentRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          createMany: {
            args: Prisma.AgentRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          delete: {
            args: Prisma.AgentRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          update: {
            args: Prisma.AgentRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          deleteMany: {
            args: Prisma.AgentRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgentRunUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          upsert: {
            args: Prisma.AgentRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          aggregate: {
            args: Prisma.AgentRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentRun>
          }
          groupBy: {
            args: Prisma.AgentRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentRunCountArgs<ExtArgs>
            result: $Utils.Optional<AgentRunCountAggregateOutputType> | number
          }
        }
      }
      TokenBudget: {
        payload: Prisma.$TokenBudgetPayload<ExtArgs>
        fields: Prisma.TokenBudgetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TokenBudgetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TokenBudgetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>
          }
          findFirst: {
            args: Prisma.TokenBudgetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TokenBudgetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>
          }
          findMany: {
            args: Prisma.TokenBudgetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>[]
          }
          create: {
            args: Prisma.TokenBudgetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>
          }
          createMany: {
            args: Prisma.TokenBudgetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TokenBudgetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>[]
          }
          delete: {
            args: Prisma.TokenBudgetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>
          }
          update: {
            args: Prisma.TokenBudgetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>
          }
          deleteMany: {
            args: Prisma.TokenBudgetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TokenBudgetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TokenBudgetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>[]
          }
          upsert: {
            args: Prisma.TokenBudgetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenBudgetPayload>
          }
          aggregate: {
            args: Prisma.TokenBudgetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTokenBudget>
          }
          groupBy: {
            args: Prisma.TokenBudgetGroupByArgs<ExtArgs>
            result: $Utils.Optional<TokenBudgetGroupByOutputType>[]
          }
          count: {
            args: Prisma.TokenBudgetCountArgs<ExtArgs>
            result: $Utils.Optional<TokenBudgetCountAggregateOutputType> | number
          }
        }
      }
      AnalyticsEvent: {
        payload: Prisma.$AnalyticsEventPayload<ExtArgs>
        fields: Prisma.AnalyticsEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnalyticsEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnalyticsEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          findFirst: {
            args: Prisma.AnalyticsEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnalyticsEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          findMany: {
            args: Prisma.AnalyticsEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[]
          }
          create: {
            args: Prisma.AnalyticsEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          createMany: {
            args: Prisma.AnalyticsEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnalyticsEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[]
          }
          delete: {
            args: Prisma.AnalyticsEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          update: {
            args: Prisma.AnalyticsEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          deleteMany: {
            args: Prisma.AnalyticsEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnalyticsEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnalyticsEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>[]
          }
          upsert: {
            args: Prisma.AnalyticsEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnalyticsEventPayload>
          }
          aggregate: {
            args: Prisma.AnalyticsEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnalyticsEvent>
          }
          groupBy: {
            args: Prisma.AnalyticsEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnalyticsEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnalyticsEventCountArgs<ExtArgs>
            result: $Utils.Optional<AnalyticsEventCountAggregateOutputType> | number
          }
        }
      }
      Player: {
        payload: Prisma.$PlayerPayload<ExtArgs>
        fields: Prisma.PlayerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlayerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlayerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>
          }
          findFirst: {
            args: Prisma.PlayerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlayerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>
          }
          findMany: {
            args: Prisma.PlayerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>[]
          }
          create: {
            args: Prisma.PlayerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>
          }
          createMany: {
            args: Prisma.PlayerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlayerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>[]
          }
          delete: {
            args: Prisma.PlayerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>
          }
          update: {
            args: Prisma.PlayerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>
          }
          deleteMany: {
            args: Prisma.PlayerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlayerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlayerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>[]
          }
          upsert: {
            args: Prisma.PlayerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerPayload>
          }
          aggregate: {
            args: Prisma.PlayerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlayer>
          }
          groupBy: {
            args: Prisma.PlayerGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlayerGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlayerCountArgs<ExtArgs>
            result: $Utils.Optional<PlayerCountAggregateOutputType> | number
          }
        }
      }
      PlayerRanking: {
        payload: Prisma.$PlayerRankingPayload<ExtArgs>
        fields: Prisma.PlayerRankingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlayerRankingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlayerRankingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>
          }
          findFirst: {
            args: Prisma.PlayerRankingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlayerRankingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>
          }
          findMany: {
            args: Prisma.PlayerRankingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>[]
          }
          create: {
            args: Prisma.PlayerRankingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>
          }
          createMany: {
            args: Prisma.PlayerRankingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlayerRankingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>[]
          }
          delete: {
            args: Prisma.PlayerRankingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>
          }
          update: {
            args: Prisma.PlayerRankingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>
          }
          deleteMany: {
            args: Prisma.PlayerRankingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlayerRankingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlayerRankingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>[]
          }
          upsert: {
            args: Prisma.PlayerRankingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerRankingPayload>
          }
          aggregate: {
            args: Prisma.PlayerRankingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlayerRanking>
          }
          groupBy: {
            args: Prisma.PlayerRankingGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlayerRankingGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlayerRankingCountArgs<ExtArgs>
            result: $Utils.Optional<PlayerRankingCountAggregateOutputType> | number
          }
        }
      }
      TrendingPlayer: {
        payload: Prisma.$TrendingPlayerPayload<ExtArgs>
        fields: Prisma.TrendingPlayerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrendingPlayerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrendingPlayerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>
          }
          findFirst: {
            args: Prisma.TrendingPlayerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrendingPlayerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>
          }
          findMany: {
            args: Prisma.TrendingPlayerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>[]
          }
          create: {
            args: Prisma.TrendingPlayerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>
          }
          createMany: {
            args: Prisma.TrendingPlayerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrendingPlayerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>[]
          }
          delete: {
            args: Prisma.TrendingPlayerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>
          }
          update: {
            args: Prisma.TrendingPlayerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>
          }
          deleteMany: {
            args: Prisma.TrendingPlayerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrendingPlayerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TrendingPlayerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>[]
          }
          upsert: {
            args: Prisma.TrendingPlayerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrendingPlayerPayload>
          }
          aggregate: {
            args: Prisma.TrendingPlayerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrendingPlayer>
          }
          groupBy: {
            args: Prisma.TrendingPlayerGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrendingPlayerGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrendingPlayerCountArgs<ExtArgs>
            result: $Utils.Optional<TrendingPlayerCountAggregateOutputType> | number
          }
        }
      }
      ContentItem: {
        payload: Prisma.$ContentItemPayload<ExtArgs>
        fields: Prisma.ContentItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContentItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContentItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>
          }
          findFirst: {
            args: Prisma.ContentItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContentItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>
          }
          findMany: {
            args: Prisma.ContentItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>[]
          }
          create: {
            args: Prisma.ContentItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>
          }
          createMany: {
            args: Prisma.ContentItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContentItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>[]
          }
          delete: {
            args: Prisma.ContentItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>
          }
          update: {
            args: Prisma.ContentItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>
          }
          deleteMany: {
            args: Prisma.ContentItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContentItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ContentItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>[]
          }
          upsert: {
            args: Prisma.ContentItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentItemPayload>
          }
          aggregate: {
            args: Prisma.ContentItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContentItem>
          }
          groupBy: {
            args: Prisma.ContentItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContentItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContentItemCountArgs<ExtArgs>
            result: $Utils.Optional<ContentItemCountAggregateOutputType> | number
          }
        }
      }
      ContentSource: {
        payload: Prisma.$ContentSourcePayload<ExtArgs>
        fields: Prisma.ContentSourceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContentSourceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContentSourceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>
          }
          findFirst: {
            args: Prisma.ContentSourceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContentSourceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>
          }
          findMany: {
            args: Prisma.ContentSourceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>[]
          }
          create: {
            args: Prisma.ContentSourceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>
          }
          createMany: {
            args: Prisma.ContentSourceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContentSourceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>[]
          }
          delete: {
            args: Prisma.ContentSourceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>
          }
          update: {
            args: Prisma.ContentSourceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>
          }
          deleteMany: {
            args: Prisma.ContentSourceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContentSourceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ContentSourceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>[]
          }
          upsert: {
            args: Prisma.ContentSourceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContentSourcePayload>
          }
          aggregate: {
            args: Prisma.ContentSourceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContentSource>
          }
          groupBy: {
            args: Prisma.ContentSourceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContentSourceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContentSourceCountArgs<ExtArgs>
            result: $Utils.Optional<ContentSourceCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    sleeperProfile?: SleeperProfileOmit
    userPreferences?: UserPreferencesOmit
    agentRun?: AgentRunOmit
    tokenBudget?: TokenBudgetOmit
    analyticsEvent?: AnalyticsEventOmit
    player?: PlayerOmit
    playerRanking?: PlayerRankingOmit
    trendingPlayer?: TrendingPlayerOmit
    contentItem?: ContentItemOmit
    contentSource?: ContentSourceOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    agentRuns: number
    tokenBudget: number
    analyticsEvents: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agentRuns?: boolean | UserCountOutputTypeCountAgentRunsArgs
    tokenBudget?: boolean | UserCountOutputTypeCountTokenBudgetArgs
    analyticsEvents?: boolean | UserCountOutputTypeCountAnalyticsEventsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAgentRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTokenBudgetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenBudgetWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAnalyticsEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnalyticsEventWhereInput
  }


  /**
   * Count Type PlayerCountOutputType
   */

  export type PlayerCountOutputType = {
    rankings: number
    trending: number
  }

  export type PlayerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rankings?: boolean | PlayerCountOutputTypeCountRankingsArgs
    trending?: boolean | PlayerCountOutputTypeCountTrendingArgs
  }

  // Custom InputTypes
  /**
   * PlayerCountOutputType without action
   */
  export type PlayerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerCountOutputType
     */
    select?: PlayerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PlayerCountOutputType without action
   */
  export type PlayerCountOutputTypeCountRankingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlayerRankingWhereInput
  }

  /**
   * PlayerCountOutputType without action
   */
  export type PlayerCountOutputTypeCountTrendingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrendingPlayerWhereInput
  }


  /**
   * Count Type ContentSourceCountOutputType
   */

  export type ContentSourceCountOutputType = {
    items: number
  }

  export type ContentSourceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | ContentSourceCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * ContentSourceCountOutputType without action
   */
  export type ContentSourceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSourceCountOutputType
     */
    select?: ContentSourceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ContentSourceCountOutputType without action
   */
  export type ContentSourceCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContentItemWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    runCredits: number | null
  }

  export type UserSumAggregateOutputType = {
    runCredits: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    clerkId: string | null
    email: string | null
    tier: $Enums.UserTier | null
    role: $Enums.UserRole | null
    runCredits: number | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    stripeSubscriptionStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    clerkId: string | null
    email: string | null
    tier: $Enums.UserTier | null
    role: $Enums.UserRole | null
    runCredits: number | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    stripeSubscriptionStatus: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    clerkId: number
    email: number
    tier: number
    role: number
    runCredits: number
    stripeCustomerId: number
    stripeSubscriptionId: number
    stripeSubscriptionStatus: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    runCredits?: true
  }

  export type UserSumAggregateInputType = {
    runCredits?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    clerkId?: true
    email?: true
    tier?: true
    role?: true
    runCredits?: true
    stripeCustomerId?: true
    stripeSubscriptionId?: true
    stripeSubscriptionStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    clerkId?: true
    email?: true
    tier?: true
    role?: true
    runCredits?: true
    stripeCustomerId?: true
    stripeSubscriptionId?: true
    stripeSubscriptionStatus?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    clerkId?: true
    email?: true
    tier?: true
    role?: true
    runCredits?: true
    stripeCustomerId?: true
    stripeSubscriptionId?: true
    stripeSubscriptionStatus?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    clerkId: string
    email: string
    tier: $Enums.UserTier
    role: $Enums.UserRole
    runCredits: number
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    stripeSubscriptionStatus: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    email?: boolean
    tier?: boolean
    role?: boolean
    runCredits?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    stripeSubscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sleeperProfile?: boolean | User$sleeperProfileArgs<ExtArgs>
    preferences?: boolean | User$preferencesArgs<ExtArgs>
    agentRuns?: boolean | User$agentRunsArgs<ExtArgs>
    tokenBudget?: boolean | User$tokenBudgetArgs<ExtArgs>
    analyticsEvents?: boolean | User$analyticsEventsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    email?: boolean
    tier?: boolean
    role?: boolean
    runCredits?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    stripeSubscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerkId?: boolean
    email?: boolean
    tier?: boolean
    role?: boolean
    runCredits?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    stripeSubscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    clerkId?: boolean
    email?: boolean
    tier?: boolean
    role?: boolean
    runCredits?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    stripeSubscriptionStatus?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "clerkId" | "email" | "tier" | "role" | "runCredits" | "stripeCustomerId" | "stripeSubscriptionId" | "stripeSubscriptionStatus" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sleeperProfile?: boolean | User$sleeperProfileArgs<ExtArgs>
    preferences?: boolean | User$preferencesArgs<ExtArgs>
    agentRuns?: boolean | User$agentRunsArgs<ExtArgs>
    tokenBudget?: boolean | User$tokenBudgetArgs<ExtArgs>
    analyticsEvents?: boolean | User$analyticsEventsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      sleeperProfile: Prisma.$SleeperProfilePayload<ExtArgs> | null
      preferences: Prisma.$UserPreferencesPayload<ExtArgs> | null
      agentRuns: Prisma.$AgentRunPayload<ExtArgs>[]
      tokenBudget: Prisma.$TokenBudgetPayload<ExtArgs>[]
      analyticsEvents: Prisma.$AnalyticsEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      /**
       * Clerk user ID — links our DB record to Clerk's auth record
       */
      clerkId: string
      email: string
      tier: $Enums.UserTier
      role: $Enums.UserRole
      /**
       * Remaining agent run credits. Free = 2 (lifetime). Paid = 50/mo.
       */
      runCredits: number
      /**
       * Stripe fields — populated on first checkout (Phase 2)
       */
      stripeCustomerId: string | null
      stripeSubscriptionId: string | null
      stripeSubscriptionStatus: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sleeperProfile<T extends User$sleeperProfileArgs<ExtArgs> = {}>(args?: Subset<T, User$sleeperProfileArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    preferences<T extends User$preferencesArgs<ExtArgs> = {}>(args?: Subset<T, User$preferencesArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    agentRuns<T extends User$agentRunsArgs<ExtArgs> = {}>(args?: Subset<T, User$agentRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tokenBudget<T extends User$tokenBudgetArgs<ExtArgs> = {}>(args?: Subset<T, User$tokenBudgetArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    analyticsEvents<T extends User$analyticsEventsArgs<ExtArgs> = {}>(args?: Subset<T, User$analyticsEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly clerkId: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly tier: FieldRef<"User", 'UserTier'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly runCredits: FieldRef<"User", 'Int'>
    readonly stripeCustomerId: FieldRef<"User", 'String'>
    readonly stripeSubscriptionId: FieldRef<"User", 'String'>
    readonly stripeSubscriptionStatus: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.sleeperProfile
   */
  export type User$sleeperProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    where?: SleeperProfileWhereInput
  }

  /**
   * User.preferences
   */
  export type User$preferencesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    where?: UserPreferencesWhereInput
  }

  /**
   * User.agentRuns
   */
  export type User$agentRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    cursor?: AgentRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * User.tokenBudget
   */
  export type User$tokenBudgetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    where?: TokenBudgetWhereInput
    orderBy?: TokenBudgetOrderByWithRelationInput | TokenBudgetOrderByWithRelationInput[]
    cursor?: TokenBudgetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TokenBudgetScalarFieldEnum | TokenBudgetScalarFieldEnum[]
  }

  /**
   * User.analyticsEvents
   */
  export type User$analyticsEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    where?: AnalyticsEventWhereInput
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    cursor?: AnalyticsEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model SleeperProfile
   */

  export type AggregateSleeperProfile = {
    _count: SleeperProfileCountAggregateOutputType | null
    _min: SleeperProfileMinAggregateOutputType | null
    _max: SleeperProfileMaxAggregateOutputType | null
  }

  export type SleeperProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    sleeperId: string | null
    displayName: string | null
    updatedAt: Date | null
  }

  export type SleeperProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    sleeperId: string | null
    displayName: string | null
    updatedAt: Date | null
  }

  export type SleeperProfileCountAggregateOutputType = {
    id: number
    userId: number
    sleeperId: number
    displayName: number
    leagues: number
    updatedAt: number
    _all: number
  }


  export type SleeperProfileMinAggregateInputType = {
    id?: true
    userId?: true
    sleeperId?: true
    displayName?: true
    updatedAt?: true
  }

  export type SleeperProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    sleeperId?: true
    displayName?: true
    updatedAt?: true
  }

  export type SleeperProfileCountAggregateInputType = {
    id?: true
    userId?: true
    sleeperId?: true
    displayName?: true
    leagues?: true
    updatedAt?: true
    _all?: true
  }

  export type SleeperProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SleeperProfile to aggregate.
     */
    where?: SleeperProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SleeperProfiles to fetch.
     */
    orderBy?: SleeperProfileOrderByWithRelationInput | SleeperProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SleeperProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SleeperProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SleeperProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SleeperProfiles
    **/
    _count?: true | SleeperProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SleeperProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SleeperProfileMaxAggregateInputType
  }

  export type GetSleeperProfileAggregateType<T extends SleeperProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateSleeperProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSleeperProfile[P]>
      : GetScalarType<T[P], AggregateSleeperProfile[P]>
  }




  export type SleeperProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SleeperProfileWhereInput
    orderBy?: SleeperProfileOrderByWithAggregationInput | SleeperProfileOrderByWithAggregationInput[]
    by: SleeperProfileScalarFieldEnum[] | SleeperProfileScalarFieldEnum
    having?: SleeperProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SleeperProfileCountAggregateInputType | true
    _min?: SleeperProfileMinAggregateInputType
    _max?: SleeperProfileMaxAggregateInputType
  }

  export type SleeperProfileGroupByOutputType = {
    id: string
    userId: string
    sleeperId: string
    displayName: string
    leagues: JsonValue
    updatedAt: Date
    _count: SleeperProfileCountAggregateOutputType | null
    _min: SleeperProfileMinAggregateOutputType | null
    _max: SleeperProfileMaxAggregateOutputType | null
  }

  type GetSleeperProfileGroupByPayload<T extends SleeperProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SleeperProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SleeperProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SleeperProfileGroupByOutputType[P]>
            : GetScalarType<T[P], SleeperProfileGroupByOutputType[P]>
        }
      >
    >


  export type SleeperProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    sleeperId?: boolean
    displayName?: boolean
    leagues?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sleeperProfile"]>

  export type SleeperProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    sleeperId?: boolean
    displayName?: boolean
    leagues?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sleeperProfile"]>

  export type SleeperProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    sleeperId?: boolean
    displayName?: boolean
    leagues?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sleeperProfile"]>

  export type SleeperProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    sleeperId?: boolean
    displayName?: boolean
    leagues?: boolean
    updatedAt?: boolean
  }

  export type SleeperProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "sleeperId" | "displayName" | "leagues" | "updatedAt", ExtArgs["result"]["sleeperProfile"]>
  export type SleeperProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SleeperProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SleeperProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SleeperProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SleeperProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      /**
       * Sleeper's internal user_id
       */
      sleeperId: string
      displayName: string
      /**
       * Snapshot of the user's leagues array from Sleeper API
       */
      leagues: Prisma.JsonValue
      updatedAt: Date
    }, ExtArgs["result"]["sleeperProfile"]>
    composites: {}
  }

  type SleeperProfileGetPayload<S extends boolean | null | undefined | SleeperProfileDefaultArgs> = $Result.GetResult<Prisma.$SleeperProfilePayload, S>

  type SleeperProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SleeperProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SleeperProfileCountAggregateInputType | true
    }

  export interface SleeperProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SleeperProfile'], meta: { name: 'SleeperProfile' } }
    /**
     * Find zero or one SleeperProfile that matches the filter.
     * @param {SleeperProfileFindUniqueArgs} args - Arguments to find a SleeperProfile
     * @example
     * // Get one SleeperProfile
     * const sleeperProfile = await prisma.sleeperProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SleeperProfileFindUniqueArgs>(args: SelectSubset<T, SleeperProfileFindUniqueArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SleeperProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SleeperProfileFindUniqueOrThrowArgs} args - Arguments to find a SleeperProfile
     * @example
     * // Get one SleeperProfile
     * const sleeperProfile = await prisma.sleeperProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SleeperProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, SleeperProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SleeperProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileFindFirstArgs} args - Arguments to find a SleeperProfile
     * @example
     * // Get one SleeperProfile
     * const sleeperProfile = await prisma.sleeperProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SleeperProfileFindFirstArgs>(args?: SelectSubset<T, SleeperProfileFindFirstArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SleeperProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileFindFirstOrThrowArgs} args - Arguments to find a SleeperProfile
     * @example
     * // Get one SleeperProfile
     * const sleeperProfile = await prisma.sleeperProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SleeperProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, SleeperProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SleeperProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SleeperProfiles
     * const sleeperProfiles = await prisma.sleeperProfile.findMany()
     * 
     * // Get first 10 SleeperProfiles
     * const sleeperProfiles = await prisma.sleeperProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sleeperProfileWithIdOnly = await prisma.sleeperProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SleeperProfileFindManyArgs>(args?: SelectSubset<T, SleeperProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SleeperProfile.
     * @param {SleeperProfileCreateArgs} args - Arguments to create a SleeperProfile.
     * @example
     * // Create one SleeperProfile
     * const SleeperProfile = await prisma.sleeperProfile.create({
     *   data: {
     *     // ... data to create a SleeperProfile
     *   }
     * })
     * 
     */
    create<T extends SleeperProfileCreateArgs>(args: SelectSubset<T, SleeperProfileCreateArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SleeperProfiles.
     * @param {SleeperProfileCreateManyArgs} args - Arguments to create many SleeperProfiles.
     * @example
     * // Create many SleeperProfiles
     * const sleeperProfile = await prisma.sleeperProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SleeperProfileCreateManyArgs>(args?: SelectSubset<T, SleeperProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SleeperProfiles and returns the data saved in the database.
     * @param {SleeperProfileCreateManyAndReturnArgs} args - Arguments to create many SleeperProfiles.
     * @example
     * // Create many SleeperProfiles
     * const sleeperProfile = await prisma.sleeperProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SleeperProfiles and only return the `id`
     * const sleeperProfileWithIdOnly = await prisma.sleeperProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SleeperProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, SleeperProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SleeperProfile.
     * @param {SleeperProfileDeleteArgs} args - Arguments to delete one SleeperProfile.
     * @example
     * // Delete one SleeperProfile
     * const SleeperProfile = await prisma.sleeperProfile.delete({
     *   where: {
     *     // ... filter to delete one SleeperProfile
     *   }
     * })
     * 
     */
    delete<T extends SleeperProfileDeleteArgs>(args: SelectSubset<T, SleeperProfileDeleteArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SleeperProfile.
     * @param {SleeperProfileUpdateArgs} args - Arguments to update one SleeperProfile.
     * @example
     * // Update one SleeperProfile
     * const sleeperProfile = await prisma.sleeperProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SleeperProfileUpdateArgs>(args: SelectSubset<T, SleeperProfileUpdateArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SleeperProfiles.
     * @param {SleeperProfileDeleteManyArgs} args - Arguments to filter SleeperProfiles to delete.
     * @example
     * // Delete a few SleeperProfiles
     * const { count } = await prisma.sleeperProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SleeperProfileDeleteManyArgs>(args?: SelectSubset<T, SleeperProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SleeperProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SleeperProfiles
     * const sleeperProfile = await prisma.sleeperProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SleeperProfileUpdateManyArgs>(args: SelectSubset<T, SleeperProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SleeperProfiles and returns the data updated in the database.
     * @param {SleeperProfileUpdateManyAndReturnArgs} args - Arguments to update many SleeperProfiles.
     * @example
     * // Update many SleeperProfiles
     * const sleeperProfile = await prisma.sleeperProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SleeperProfiles and only return the `id`
     * const sleeperProfileWithIdOnly = await prisma.sleeperProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SleeperProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, SleeperProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SleeperProfile.
     * @param {SleeperProfileUpsertArgs} args - Arguments to update or create a SleeperProfile.
     * @example
     * // Update or create a SleeperProfile
     * const sleeperProfile = await prisma.sleeperProfile.upsert({
     *   create: {
     *     // ... data to create a SleeperProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SleeperProfile we want to update
     *   }
     * })
     */
    upsert<T extends SleeperProfileUpsertArgs>(args: SelectSubset<T, SleeperProfileUpsertArgs<ExtArgs>>): Prisma__SleeperProfileClient<$Result.GetResult<Prisma.$SleeperProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SleeperProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileCountArgs} args - Arguments to filter SleeperProfiles to count.
     * @example
     * // Count the number of SleeperProfiles
     * const count = await prisma.sleeperProfile.count({
     *   where: {
     *     // ... the filter for the SleeperProfiles we want to count
     *   }
     * })
    **/
    count<T extends SleeperProfileCountArgs>(
      args?: Subset<T, SleeperProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SleeperProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SleeperProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SleeperProfileAggregateArgs>(args: Subset<T, SleeperProfileAggregateArgs>): Prisma.PrismaPromise<GetSleeperProfileAggregateType<T>>

    /**
     * Group by SleeperProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SleeperProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SleeperProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SleeperProfileGroupByArgs['orderBy'] }
        : { orderBy?: SleeperProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SleeperProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSleeperProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SleeperProfile model
   */
  readonly fields: SleeperProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SleeperProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SleeperProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SleeperProfile model
   */
  interface SleeperProfileFieldRefs {
    readonly id: FieldRef<"SleeperProfile", 'String'>
    readonly userId: FieldRef<"SleeperProfile", 'String'>
    readonly sleeperId: FieldRef<"SleeperProfile", 'String'>
    readonly displayName: FieldRef<"SleeperProfile", 'String'>
    readonly leagues: FieldRef<"SleeperProfile", 'Json'>
    readonly updatedAt: FieldRef<"SleeperProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SleeperProfile findUnique
   */
  export type SleeperProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * Filter, which SleeperProfile to fetch.
     */
    where: SleeperProfileWhereUniqueInput
  }

  /**
   * SleeperProfile findUniqueOrThrow
   */
  export type SleeperProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * Filter, which SleeperProfile to fetch.
     */
    where: SleeperProfileWhereUniqueInput
  }

  /**
   * SleeperProfile findFirst
   */
  export type SleeperProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * Filter, which SleeperProfile to fetch.
     */
    where?: SleeperProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SleeperProfiles to fetch.
     */
    orderBy?: SleeperProfileOrderByWithRelationInput | SleeperProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SleeperProfiles.
     */
    cursor?: SleeperProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SleeperProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SleeperProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SleeperProfiles.
     */
    distinct?: SleeperProfileScalarFieldEnum | SleeperProfileScalarFieldEnum[]
  }

  /**
   * SleeperProfile findFirstOrThrow
   */
  export type SleeperProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * Filter, which SleeperProfile to fetch.
     */
    where?: SleeperProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SleeperProfiles to fetch.
     */
    orderBy?: SleeperProfileOrderByWithRelationInput | SleeperProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SleeperProfiles.
     */
    cursor?: SleeperProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SleeperProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SleeperProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SleeperProfiles.
     */
    distinct?: SleeperProfileScalarFieldEnum | SleeperProfileScalarFieldEnum[]
  }

  /**
   * SleeperProfile findMany
   */
  export type SleeperProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * Filter, which SleeperProfiles to fetch.
     */
    where?: SleeperProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SleeperProfiles to fetch.
     */
    orderBy?: SleeperProfileOrderByWithRelationInput | SleeperProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SleeperProfiles.
     */
    cursor?: SleeperProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SleeperProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SleeperProfiles.
     */
    skip?: number
    distinct?: SleeperProfileScalarFieldEnum | SleeperProfileScalarFieldEnum[]
  }

  /**
   * SleeperProfile create
   */
  export type SleeperProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a SleeperProfile.
     */
    data: XOR<SleeperProfileCreateInput, SleeperProfileUncheckedCreateInput>
  }

  /**
   * SleeperProfile createMany
   */
  export type SleeperProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SleeperProfiles.
     */
    data: SleeperProfileCreateManyInput | SleeperProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SleeperProfile createManyAndReturn
   */
  export type SleeperProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * The data used to create many SleeperProfiles.
     */
    data: SleeperProfileCreateManyInput | SleeperProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SleeperProfile update
   */
  export type SleeperProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a SleeperProfile.
     */
    data: XOR<SleeperProfileUpdateInput, SleeperProfileUncheckedUpdateInput>
    /**
     * Choose, which SleeperProfile to update.
     */
    where: SleeperProfileWhereUniqueInput
  }

  /**
   * SleeperProfile updateMany
   */
  export type SleeperProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SleeperProfiles.
     */
    data: XOR<SleeperProfileUpdateManyMutationInput, SleeperProfileUncheckedUpdateManyInput>
    /**
     * Filter which SleeperProfiles to update
     */
    where?: SleeperProfileWhereInput
    /**
     * Limit how many SleeperProfiles to update.
     */
    limit?: number
  }

  /**
   * SleeperProfile updateManyAndReturn
   */
  export type SleeperProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * The data used to update SleeperProfiles.
     */
    data: XOR<SleeperProfileUpdateManyMutationInput, SleeperProfileUncheckedUpdateManyInput>
    /**
     * Filter which SleeperProfiles to update
     */
    where?: SleeperProfileWhereInput
    /**
     * Limit how many SleeperProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SleeperProfile upsert
   */
  export type SleeperProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the SleeperProfile to update in case it exists.
     */
    where: SleeperProfileWhereUniqueInput
    /**
     * In case the SleeperProfile found by the `where` argument doesn't exist, create a new SleeperProfile with this data.
     */
    create: XOR<SleeperProfileCreateInput, SleeperProfileUncheckedCreateInput>
    /**
     * In case the SleeperProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SleeperProfileUpdateInput, SleeperProfileUncheckedUpdateInput>
  }

  /**
   * SleeperProfile delete
   */
  export type SleeperProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
    /**
     * Filter which SleeperProfile to delete.
     */
    where: SleeperProfileWhereUniqueInput
  }

  /**
   * SleeperProfile deleteMany
   */
  export type SleeperProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SleeperProfiles to delete
     */
    where?: SleeperProfileWhereInput
    /**
     * Limit how many SleeperProfiles to delete.
     */
    limit?: number
  }

  /**
   * SleeperProfile without action
   */
  export type SleeperProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SleeperProfile
     */
    select?: SleeperProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SleeperProfile
     */
    omit?: SleeperProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SleeperProfileInclude<ExtArgs> | null
  }


  /**
   * Model UserPreferences
   */

  export type AggregateUserPreferences = {
    _count: UserPreferencesCountAggregateOutputType | null
    _min: UserPreferencesMinAggregateOutputType | null
    _max: UserPreferencesMaxAggregateOutputType | null
  }

  export type UserPreferencesMinAggregateOutputType = {
    id: string | null
    userId: string | null
    leagueStyle: $Enums.LeagueStyle | null
    scoringPriority: $Enums.ScoringPriority | null
    playStyle: $Enums.PlayStyle | null
    reportFormat: $Enums.ReportFormat | null
    customInstructions: string | null
    notifyOnInjury: boolean | null
    notifyOnTrending: boolean | null
    updatedAt: Date | null
  }

  export type UserPreferencesMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    leagueStyle: $Enums.LeagueStyle | null
    scoringPriority: $Enums.ScoringPriority | null
    playStyle: $Enums.PlayStyle | null
    reportFormat: $Enums.ReportFormat | null
    customInstructions: string | null
    notifyOnInjury: boolean | null
    notifyOnTrending: boolean | null
    updatedAt: Date | null
  }

  export type UserPreferencesCountAggregateOutputType = {
    id: number
    userId: number
    leagueStyle: number
    scoringPriority: number
    playStyle: number
    reportFormat: number
    priorityPositions: number
    customInstructions: number
    notifyOnInjury: number
    notifyOnTrending: number
    updatedAt: number
    _all: number
  }


  export type UserPreferencesMinAggregateInputType = {
    id?: true
    userId?: true
    leagueStyle?: true
    scoringPriority?: true
    playStyle?: true
    reportFormat?: true
    customInstructions?: true
    notifyOnInjury?: true
    notifyOnTrending?: true
    updatedAt?: true
  }

  export type UserPreferencesMaxAggregateInputType = {
    id?: true
    userId?: true
    leagueStyle?: true
    scoringPriority?: true
    playStyle?: true
    reportFormat?: true
    customInstructions?: true
    notifyOnInjury?: true
    notifyOnTrending?: true
    updatedAt?: true
  }

  export type UserPreferencesCountAggregateInputType = {
    id?: true
    userId?: true
    leagueStyle?: true
    scoringPriority?: true
    playStyle?: true
    reportFormat?: true
    priorityPositions?: true
    customInstructions?: true
    notifyOnInjury?: true
    notifyOnTrending?: true
    updatedAt?: true
    _all?: true
  }

  export type UserPreferencesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPreferences to aggregate.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserPreferences
    **/
    _count?: true | UserPreferencesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserPreferencesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserPreferencesMaxAggregateInputType
  }

  export type GetUserPreferencesAggregateType<T extends UserPreferencesAggregateArgs> = {
        [P in keyof T & keyof AggregateUserPreferences]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserPreferences[P]>
      : GetScalarType<T[P], AggregateUserPreferences[P]>
  }




  export type UserPreferencesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPreferencesWhereInput
    orderBy?: UserPreferencesOrderByWithAggregationInput | UserPreferencesOrderByWithAggregationInput[]
    by: UserPreferencesScalarFieldEnum[] | UserPreferencesScalarFieldEnum
    having?: UserPreferencesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserPreferencesCountAggregateInputType | true
    _min?: UserPreferencesMinAggregateInputType
    _max?: UserPreferencesMaxAggregateInputType
  }

  export type UserPreferencesGroupByOutputType = {
    id: string
    userId: string
    leagueStyle: $Enums.LeagueStyle
    scoringPriority: $Enums.ScoringPriority
    playStyle: $Enums.PlayStyle
    reportFormat: $Enums.ReportFormat
    priorityPositions: string[]
    customInstructions: string | null
    notifyOnInjury: boolean
    notifyOnTrending: boolean
    updatedAt: Date
    _count: UserPreferencesCountAggregateOutputType | null
    _min: UserPreferencesMinAggregateOutputType | null
    _max: UserPreferencesMaxAggregateOutputType | null
  }

  type GetUserPreferencesGroupByPayload<T extends UserPreferencesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserPreferencesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserPreferencesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserPreferencesGroupByOutputType[P]>
            : GetScalarType<T[P], UserPreferencesGroupByOutputType[P]>
        }
      >
    >


  export type UserPreferencesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    leagueStyle?: boolean
    scoringPriority?: boolean
    playStyle?: boolean
    reportFormat?: boolean
    priorityPositions?: boolean
    customInstructions?: boolean
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPreferences"]>

  export type UserPreferencesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    leagueStyle?: boolean
    scoringPriority?: boolean
    playStyle?: boolean
    reportFormat?: boolean
    priorityPositions?: boolean
    customInstructions?: boolean
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPreferences"]>

  export type UserPreferencesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    leagueStyle?: boolean
    scoringPriority?: boolean
    playStyle?: boolean
    reportFormat?: boolean
    priorityPositions?: boolean
    customInstructions?: boolean
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPreferences"]>

  export type UserPreferencesSelectScalar = {
    id?: boolean
    userId?: boolean
    leagueStyle?: boolean
    scoringPriority?: boolean
    playStyle?: boolean
    reportFormat?: boolean
    priorityPositions?: boolean
    customInstructions?: boolean
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: boolean
  }

  export type UserPreferencesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "leagueStyle" | "scoringPriority" | "playStyle" | "reportFormat" | "priorityPositions" | "customInstructions" | "notifyOnInjury" | "notifyOnTrending" | "updatedAt", ExtArgs["result"]["userPreferences"]>
  export type UserPreferencesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPreferencesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPreferencesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserPreferencesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserPreferences"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      leagueStyle: $Enums.LeagueStyle
      scoringPriority: $Enums.ScoringPriority
      playStyle: $Enums.PlayStyle
      reportFormat: $Enums.ReportFormat
      /**
       * Array of positions the user cares most about e.g. ["RB", "WR"]
       */
      priorityPositions: string[]
      /**
       * Free-text prompt additions injected into every agent run
       */
      customInstructions: string | null
      notifyOnInjury: boolean
      notifyOnTrending: boolean
      updatedAt: Date
    }, ExtArgs["result"]["userPreferences"]>
    composites: {}
  }

  type UserPreferencesGetPayload<S extends boolean | null | undefined | UserPreferencesDefaultArgs> = $Result.GetResult<Prisma.$UserPreferencesPayload, S>

  type UserPreferencesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserPreferencesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserPreferencesCountAggregateInputType | true
    }

  export interface UserPreferencesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserPreferences'], meta: { name: 'UserPreferences' } }
    /**
     * Find zero or one UserPreferences that matches the filter.
     * @param {UserPreferencesFindUniqueArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserPreferencesFindUniqueArgs>(args: SelectSubset<T, UserPreferencesFindUniqueArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserPreferences that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserPreferencesFindUniqueOrThrowArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserPreferencesFindUniqueOrThrowArgs>(args: SelectSubset<T, UserPreferencesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPreferences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesFindFirstArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserPreferencesFindFirstArgs>(args?: SelectSubset<T, UserPreferencesFindFirstArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPreferences that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesFindFirstOrThrowArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserPreferencesFindFirstOrThrowArgs>(args?: SelectSubset<T, UserPreferencesFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserPreferences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserPreferences
     * const userPreferences = await prisma.userPreferences.findMany()
     * 
     * // Get first 10 UserPreferences
     * const userPreferences = await prisma.userPreferences.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userPreferencesWithIdOnly = await prisma.userPreferences.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserPreferencesFindManyArgs>(args?: SelectSubset<T, UserPreferencesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserPreferences.
     * @param {UserPreferencesCreateArgs} args - Arguments to create a UserPreferences.
     * @example
     * // Create one UserPreferences
     * const UserPreferences = await prisma.userPreferences.create({
     *   data: {
     *     // ... data to create a UserPreferences
     *   }
     * })
     * 
     */
    create<T extends UserPreferencesCreateArgs>(args: SelectSubset<T, UserPreferencesCreateArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserPreferences.
     * @param {UserPreferencesCreateManyArgs} args - Arguments to create many UserPreferences.
     * @example
     * // Create many UserPreferences
     * const userPreferences = await prisma.userPreferences.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserPreferencesCreateManyArgs>(args?: SelectSubset<T, UserPreferencesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserPreferences and returns the data saved in the database.
     * @param {UserPreferencesCreateManyAndReturnArgs} args - Arguments to create many UserPreferences.
     * @example
     * // Create many UserPreferences
     * const userPreferences = await prisma.userPreferences.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserPreferences and only return the `id`
     * const userPreferencesWithIdOnly = await prisma.userPreferences.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserPreferencesCreateManyAndReturnArgs>(args?: SelectSubset<T, UserPreferencesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserPreferences.
     * @param {UserPreferencesDeleteArgs} args - Arguments to delete one UserPreferences.
     * @example
     * // Delete one UserPreferences
     * const UserPreferences = await prisma.userPreferences.delete({
     *   where: {
     *     // ... filter to delete one UserPreferences
     *   }
     * })
     * 
     */
    delete<T extends UserPreferencesDeleteArgs>(args: SelectSubset<T, UserPreferencesDeleteArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserPreferences.
     * @param {UserPreferencesUpdateArgs} args - Arguments to update one UserPreferences.
     * @example
     * // Update one UserPreferences
     * const userPreferences = await prisma.userPreferences.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserPreferencesUpdateArgs>(args: SelectSubset<T, UserPreferencesUpdateArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserPreferences.
     * @param {UserPreferencesDeleteManyArgs} args - Arguments to filter UserPreferences to delete.
     * @example
     * // Delete a few UserPreferences
     * const { count } = await prisma.userPreferences.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserPreferencesDeleteManyArgs>(args?: SelectSubset<T, UserPreferencesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserPreferences
     * const userPreferences = await prisma.userPreferences.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserPreferencesUpdateManyArgs>(args: SelectSubset<T, UserPreferencesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPreferences and returns the data updated in the database.
     * @param {UserPreferencesUpdateManyAndReturnArgs} args - Arguments to update many UserPreferences.
     * @example
     * // Update many UserPreferences
     * const userPreferences = await prisma.userPreferences.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserPreferences and only return the `id`
     * const userPreferencesWithIdOnly = await prisma.userPreferences.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserPreferencesUpdateManyAndReturnArgs>(args: SelectSubset<T, UserPreferencesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserPreferences.
     * @param {UserPreferencesUpsertArgs} args - Arguments to update or create a UserPreferences.
     * @example
     * // Update or create a UserPreferences
     * const userPreferences = await prisma.userPreferences.upsert({
     *   create: {
     *     // ... data to create a UserPreferences
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserPreferences we want to update
     *   }
     * })
     */
    upsert<T extends UserPreferencesUpsertArgs>(args: SelectSubset<T, UserPreferencesUpsertArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesCountArgs} args - Arguments to filter UserPreferences to count.
     * @example
     * // Count the number of UserPreferences
     * const count = await prisma.userPreferences.count({
     *   where: {
     *     // ... the filter for the UserPreferences we want to count
     *   }
     * })
    **/
    count<T extends UserPreferencesCountArgs>(
      args?: Subset<T, UserPreferencesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserPreferencesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserPreferencesAggregateArgs>(args: Subset<T, UserPreferencesAggregateArgs>): Prisma.PrismaPromise<GetUserPreferencesAggregateType<T>>

    /**
     * Group by UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserPreferencesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserPreferencesGroupByArgs['orderBy'] }
        : { orderBy?: UserPreferencesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserPreferencesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPreferencesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserPreferences model
   */
  readonly fields: UserPreferencesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserPreferences.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserPreferencesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserPreferences model
   */
  interface UserPreferencesFieldRefs {
    readonly id: FieldRef<"UserPreferences", 'String'>
    readonly userId: FieldRef<"UserPreferences", 'String'>
    readonly leagueStyle: FieldRef<"UserPreferences", 'LeagueStyle'>
    readonly scoringPriority: FieldRef<"UserPreferences", 'ScoringPriority'>
    readonly playStyle: FieldRef<"UserPreferences", 'PlayStyle'>
    readonly reportFormat: FieldRef<"UserPreferences", 'ReportFormat'>
    readonly priorityPositions: FieldRef<"UserPreferences", 'String[]'>
    readonly customInstructions: FieldRef<"UserPreferences", 'String'>
    readonly notifyOnInjury: FieldRef<"UserPreferences", 'Boolean'>
    readonly notifyOnTrending: FieldRef<"UserPreferences", 'Boolean'>
    readonly updatedAt: FieldRef<"UserPreferences", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserPreferences findUnique
   */
  export type UserPreferencesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences findUniqueOrThrow
   */
  export type UserPreferencesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences findFirst
   */
  export type UserPreferencesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPreferences.
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPreferences.
     */
    distinct?: UserPreferencesScalarFieldEnum | UserPreferencesScalarFieldEnum[]
  }

  /**
   * UserPreferences findFirstOrThrow
   */
  export type UserPreferencesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPreferences.
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPreferences.
     */
    distinct?: UserPreferencesScalarFieldEnum | UserPreferencesScalarFieldEnum[]
  }

  /**
   * UserPreferences findMany
   */
  export type UserPreferencesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserPreferences.
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    distinct?: UserPreferencesScalarFieldEnum | UserPreferencesScalarFieldEnum[]
  }

  /**
   * UserPreferences create
   */
  export type UserPreferencesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * The data needed to create a UserPreferences.
     */
    data: XOR<UserPreferencesCreateInput, UserPreferencesUncheckedCreateInput>
  }

  /**
   * UserPreferences createMany
   */
  export type UserPreferencesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserPreferences.
     */
    data: UserPreferencesCreateManyInput | UserPreferencesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserPreferences createManyAndReturn
   */
  export type UserPreferencesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * The data used to create many UserPreferences.
     */
    data: UserPreferencesCreateManyInput | UserPreferencesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPreferences update
   */
  export type UserPreferencesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * The data needed to update a UserPreferences.
     */
    data: XOR<UserPreferencesUpdateInput, UserPreferencesUncheckedUpdateInput>
    /**
     * Choose, which UserPreferences to update.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences updateMany
   */
  export type UserPreferencesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserPreferences.
     */
    data: XOR<UserPreferencesUpdateManyMutationInput, UserPreferencesUncheckedUpdateManyInput>
    /**
     * Filter which UserPreferences to update
     */
    where?: UserPreferencesWhereInput
    /**
     * Limit how many UserPreferences to update.
     */
    limit?: number
  }

  /**
   * UserPreferences updateManyAndReturn
   */
  export type UserPreferencesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * The data used to update UserPreferences.
     */
    data: XOR<UserPreferencesUpdateManyMutationInput, UserPreferencesUncheckedUpdateManyInput>
    /**
     * Filter which UserPreferences to update
     */
    where?: UserPreferencesWhereInput
    /**
     * Limit how many UserPreferences to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPreferences upsert
   */
  export type UserPreferencesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * The filter to search for the UserPreferences to update in case it exists.
     */
    where: UserPreferencesWhereUniqueInput
    /**
     * In case the UserPreferences found by the `where` argument doesn't exist, create a new UserPreferences with this data.
     */
    create: XOR<UserPreferencesCreateInput, UserPreferencesUncheckedCreateInput>
    /**
     * In case the UserPreferences was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserPreferencesUpdateInput, UserPreferencesUncheckedUpdateInput>
  }

  /**
   * UserPreferences delete
   */
  export type UserPreferencesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
    /**
     * Filter which UserPreferences to delete.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences deleteMany
   */
  export type UserPreferencesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPreferences to delete
     */
    where?: UserPreferencesWhereInput
    /**
     * Limit how many UserPreferences to delete.
     */
    limit?: number
  }

  /**
   * UserPreferences without action
   */
  export type UserPreferencesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPreferencesInclude<ExtArgs> | null
  }


  /**
   * Model AgentRun
   */

  export type AggregateAgentRun = {
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  export type AgentRunAvgAggregateOutputType = {
    tokensUsed: number | null
    durationMs: number | null
  }

  export type AgentRunSumAggregateOutputType = {
    tokensUsed: number | null
    durationMs: number | null
  }

  export type AgentRunMinAggregateOutputType = {
    id: string | null
    userId: string | null
    agentType: string | null
    status: $Enums.AgentRunStatus | null
    tokensUsed: number | null
    durationMs: number | null
    rating: $Enums.AgentResultRating | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgentRunMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    agentType: string | null
    status: $Enums.AgentRunStatus | null
    tokensUsed: number | null
    durationMs: number | null
    rating: $Enums.AgentResultRating | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgentRunCountAggregateOutputType = {
    id: number
    userId: number
    agentType: number
    status: number
    inputJson: number
    outputJson: number
    tokensUsed: number
    durationMs: number
    rating: number
    errorMessage: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AgentRunAvgAggregateInputType = {
    tokensUsed?: true
    durationMs?: true
  }

  export type AgentRunSumAggregateInputType = {
    tokensUsed?: true
    durationMs?: true
  }

  export type AgentRunMinAggregateInputType = {
    id?: true
    userId?: true
    agentType?: true
    status?: true
    tokensUsed?: true
    durationMs?: true
    rating?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgentRunMaxAggregateInputType = {
    id?: true
    userId?: true
    agentType?: true
    status?: true
    tokensUsed?: true
    durationMs?: true
    rating?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgentRunCountAggregateInputType = {
    id?: true
    userId?: true
    agentType?: true
    status?: true
    inputJson?: true
    outputJson?: true
    tokensUsed?: true
    durationMs?: true
    rating?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AgentRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRun to aggregate.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentRuns
    **/
    _count?: true | AgentRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgentRunAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgentRunSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentRunMaxAggregateInputType
  }

  export type GetAgentRunAggregateType<T extends AgentRunAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentRun[P]>
      : GetScalarType<T[P], AggregateAgentRun[P]>
  }




  export type AgentRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithAggregationInput | AgentRunOrderByWithAggregationInput[]
    by: AgentRunScalarFieldEnum[] | AgentRunScalarFieldEnum
    having?: AgentRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentRunCountAggregateInputType | true
    _avg?: AgentRunAvgAggregateInputType
    _sum?: AgentRunSumAggregateInputType
    _min?: AgentRunMinAggregateInputType
    _max?: AgentRunMaxAggregateInputType
  }

  export type AgentRunGroupByOutputType = {
    id: string
    userId: string
    agentType: string
    status: $Enums.AgentRunStatus
    inputJson: JsonValue
    outputJson: JsonValue | null
    tokensUsed: number | null
    durationMs: number | null
    rating: $Enums.AgentResultRating | null
    errorMessage: string | null
    createdAt: Date
    updatedAt: Date
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  type GetAgentRunGroupByPayload<T extends AgentRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
            : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
        }
      >
    >


  export type AgentRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    agentType?: boolean
    status?: boolean
    inputJson?: boolean
    outputJson?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    rating?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    agentType?: boolean
    status?: boolean
    inputJson?: boolean
    outputJson?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    rating?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    agentType?: boolean
    status?: boolean
    inputJson?: boolean
    outputJson?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    rating?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectScalar = {
    id?: boolean
    userId?: boolean
    agentType?: boolean
    status?: boolean
    inputJson?: boolean
    outputJson?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    rating?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AgentRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "agentType" | "status" | "inputJson" | "outputJson" | "tokensUsed" | "durationMs" | "rating" | "errorMessage" | "createdAt" | "updatedAt", ExtArgs["result"]["agentRun"]>
  export type AgentRunInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AgentRunIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AgentRunIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AgentRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentRun"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      /**
       * e.g. "team_eval", "waiver", "lineup"
       */
      agentType: string
      status: $Enums.AgentRunStatus
      /**
       * Typed agent input (stored as JSON)
       */
      inputJson: Prisma.JsonValue
      /**
       * Typed agent output (null until status = done)
       */
      outputJson: Prisma.JsonValue | null
      tokensUsed: number | null
      durationMs: number | null
      /**
       * User feedback on result quality
       */
      rating: $Enums.AgentResultRating | null
      errorMessage: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["agentRun"]>
    composites: {}
  }

  type AgentRunGetPayload<S extends boolean | null | undefined | AgentRunDefaultArgs> = $Result.GetResult<Prisma.$AgentRunPayload, S>

  type AgentRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentRunCountAggregateInputType | true
    }

  export interface AgentRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentRun'], meta: { name: 'AgentRun' } }
    /**
     * Find zero or one AgentRun that matches the filter.
     * @param {AgentRunFindUniqueArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentRunFindUniqueArgs>(args: SelectSubset<T, AgentRunFindUniqueArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AgentRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentRunFindUniqueOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentRunFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentRunFindFirstArgs>(args?: SelectSubset<T, AgentRunFindFirstArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentRunFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AgentRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentRuns
     * const agentRuns = await prisma.agentRun.findMany()
     * 
     * // Get first 10 AgentRuns
     * const agentRuns = await prisma.agentRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentRunFindManyArgs>(args?: SelectSubset<T, AgentRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AgentRun.
     * @param {AgentRunCreateArgs} args - Arguments to create a AgentRun.
     * @example
     * // Create one AgentRun
     * const AgentRun = await prisma.agentRun.create({
     *   data: {
     *     // ... data to create a AgentRun
     *   }
     * })
     * 
     */
    create<T extends AgentRunCreateArgs>(args: SelectSubset<T, AgentRunCreateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AgentRuns.
     * @param {AgentRunCreateManyArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentRunCreateManyArgs>(args?: SelectSubset<T, AgentRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentRuns and returns the data saved in the database.
     * @param {AgentRunCreateManyAndReturnArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentRuns and only return the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentRunCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AgentRun.
     * @param {AgentRunDeleteArgs} args - Arguments to delete one AgentRun.
     * @example
     * // Delete one AgentRun
     * const AgentRun = await prisma.agentRun.delete({
     *   where: {
     *     // ... filter to delete one AgentRun
     *   }
     * })
     * 
     */
    delete<T extends AgentRunDeleteArgs>(args: SelectSubset<T, AgentRunDeleteArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AgentRun.
     * @param {AgentRunUpdateArgs} args - Arguments to update one AgentRun.
     * @example
     * // Update one AgentRun
     * const agentRun = await prisma.agentRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentRunUpdateArgs>(args: SelectSubset<T, AgentRunUpdateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AgentRuns.
     * @param {AgentRunDeleteManyArgs} args - Arguments to filter AgentRuns to delete.
     * @example
     * // Delete a few AgentRuns
     * const { count } = await prisma.agentRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentRunDeleteManyArgs>(args?: SelectSubset<T, AgentRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentRunUpdateManyArgs>(args: SelectSubset<T, AgentRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns and returns the data updated in the database.
     * @param {AgentRunUpdateManyAndReturnArgs} args - Arguments to update many AgentRuns.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AgentRuns and only return the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgentRunUpdateManyAndReturnArgs>(args: SelectSubset<T, AgentRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AgentRun.
     * @param {AgentRunUpsertArgs} args - Arguments to update or create a AgentRun.
     * @example
     * // Update or create a AgentRun
     * const agentRun = await prisma.agentRun.upsert({
     *   create: {
     *     // ... data to create a AgentRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentRun we want to update
     *   }
     * })
     */
    upsert<T extends AgentRunUpsertArgs>(args: SelectSubset<T, AgentRunUpsertArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCountArgs} args - Arguments to filter AgentRuns to count.
     * @example
     * // Count the number of AgentRuns
     * const count = await prisma.agentRun.count({
     *   where: {
     *     // ... the filter for the AgentRuns we want to count
     *   }
     * })
    **/
    count<T extends AgentRunCountArgs>(
      args?: Subset<T, AgentRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentRunAggregateArgs>(args: Subset<T, AgentRunAggregateArgs>): Prisma.PrismaPromise<GetAgentRunAggregateType<T>>

    /**
     * Group by AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentRunGroupByArgs['orderBy'] }
        : { orderBy?: AgentRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentRun model
   */
  readonly fields: AgentRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentRun model
   */
  interface AgentRunFieldRefs {
    readonly id: FieldRef<"AgentRun", 'String'>
    readonly userId: FieldRef<"AgentRun", 'String'>
    readonly agentType: FieldRef<"AgentRun", 'String'>
    readonly status: FieldRef<"AgentRun", 'AgentRunStatus'>
    readonly inputJson: FieldRef<"AgentRun", 'Json'>
    readonly outputJson: FieldRef<"AgentRun", 'Json'>
    readonly tokensUsed: FieldRef<"AgentRun", 'Int'>
    readonly durationMs: FieldRef<"AgentRun", 'Int'>
    readonly rating: FieldRef<"AgentRun", 'AgentResultRating'>
    readonly errorMessage: FieldRef<"AgentRun", 'String'>
    readonly createdAt: FieldRef<"AgentRun", 'DateTime'>
    readonly updatedAt: FieldRef<"AgentRun", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentRun findUnique
   */
  export type AgentRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findUniqueOrThrow
   */
  export type AgentRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findFirst
   */
  export type AgentRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findFirstOrThrow
   */
  export type AgentRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findMany
   */
  export type AgentRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter, which AgentRuns to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun create
   */
  export type AgentRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The data needed to create a AgentRun.
     */
    data: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
  }

  /**
   * AgentRun createMany
   */
  export type AgentRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentRun createManyAndReturn
   */
  export type AgentRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AgentRun update
   */
  export type AgentRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The data needed to update a AgentRun.
     */
    data: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
    /**
     * Choose, which AgentRun to update.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun updateMany
   */
  export type AgentRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
  }

  /**
   * AgentRun updateManyAndReturn
   */
  export type AgentRunUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AgentRun upsert
   */
  export type AgentRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * The filter to search for the AgentRun to update in case it exists.
     */
    where: AgentRunWhereUniqueInput
    /**
     * In case the AgentRun found by the `where` argument doesn't exist, create a new AgentRun with this data.
     */
    create: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
    /**
     * In case the AgentRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
  }

  /**
   * AgentRun delete
   */
  export type AgentRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
    /**
     * Filter which AgentRun to delete.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun deleteMany
   */
  export type AgentRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRuns to delete
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to delete.
     */
    limit?: number
  }

  /**
   * AgentRun without action
   */
  export type AgentRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentRunInclude<ExtArgs> | null
  }


  /**
   * Model TokenBudget
   */

  export type AggregateTokenBudget = {
    _count: TokenBudgetCountAggregateOutputType | null
    _avg: TokenBudgetAvgAggregateOutputType | null
    _sum: TokenBudgetSumAggregateOutputType | null
    _min: TokenBudgetMinAggregateOutputType | null
    _max: TokenBudgetMaxAggregateOutputType | null
  }

  export type TokenBudgetAvgAggregateOutputType = {
    tokensUsed: number | null
    runsUsed: number | null
  }

  export type TokenBudgetSumAggregateOutputType = {
    tokensUsed: number | null
    runsUsed: number | null
  }

  export type TokenBudgetMinAggregateOutputType = {
    id: string | null
    userId: string | null
    periodStart: Date | null
    tokensUsed: number | null
    runsUsed: number | null
  }

  export type TokenBudgetMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    periodStart: Date | null
    tokensUsed: number | null
    runsUsed: number | null
  }

  export type TokenBudgetCountAggregateOutputType = {
    id: number
    userId: number
    periodStart: number
    tokensUsed: number
    runsUsed: number
    _all: number
  }


  export type TokenBudgetAvgAggregateInputType = {
    tokensUsed?: true
    runsUsed?: true
  }

  export type TokenBudgetSumAggregateInputType = {
    tokensUsed?: true
    runsUsed?: true
  }

  export type TokenBudgetMinAggregateInputType = {
    id?: true
    userId?: true
    periodStart?: true
    tokensUsed?: true
    runsUsed?: true
  }

  export type TokenBudgetMaxAggregateInputType = {
    id?: true
    userId?: true
    periodStart?: true
    tokensUsed?: true
    runsUsed?: true
  }

  export type TokenBudgetCountAggregateInputType = {
    id?: true
    userId?: true
    periodStart?: true
    tokensUsed?: true
    runsUsed?: true
    _all?: true
  }

  export type TokenBudgetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenBudget to aggregate.
     */
    where?: TokenBudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenBudgets to fetch.
     */
    orderBy?: TokenBudgetOrderByWithRelationInput | TokenBudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TokenBudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenBudgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenBudgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TokenBudgets
    **/
    _count?: true | TokenBudgetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TokenBudgetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TokenBudgetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TokenBudgetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TokenBudgetMaxAggregateInputType
  }

  export type GetTokenBudgetAggregateType<T extends TokenBudgetAggregateArgs> = {
        [P in keyof T & keyof AggregateTokenBudget]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTokenBudget[P]>
      : GetScalarType<T[P], AggregateTokenBudget[P]>
  }




  export type TokenBudgetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenBudgetWhereInput
    orderBy?: TokenBudgetOrderByWithAggregationInput | TokenBudgetOrderByWithAggregationInput[]
    by: TokenBudgetScalarFieldEnum[] | TokenBudgetScalarFieldEnum
    having?: TokenBudgetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TokenBudgetCountAggregateInputType | true
    _avg?: TokenBudgetAvgAggregateInputType
    _sum?: TokenBudgetSumAggregateInputType
    _min?: TokenBudgetMinAggregateInputType
    _max?: TokenBudgetMaxAggregateInputType
  }

  export type TokenBudgetGroupByOutputType = {
    id: string
    userId: string
    periodStart: Date
    tokensUsed: number
    runsUsed: number
    _count: TokenBudgetCountAggregateOutputType | null
    _avg: TokenBudgetAvgAggregateOutputType | null
    _sum: TokenBudgetSumAggregateOutputType | null
    _min: TokenBudgetMinAggregateOutputType | null
    _max: TokenBudgetMaxAggregateOutputType | null
  }

  type GetTokenBudgetGroupByPayload<T extends TokenBudgetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TokenBudgetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TokenBudgetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TokenBudgetGroupByOutputType[P]>
            : GetScalarType<T[P], TokenBudgetGroupByOutputType[P]>
        }
      >
    >


  export type TokenBudgetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    periodStart?: boolean
    tokensUsed?: boolean
    runsUsed?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenBudget"]>

  export type TokenBudgetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    periodStart?: boolean
    tokensUsed?: boolean
    runsUsed?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenBudget"]>

  export type TokenBudgetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    periodStart?: boolean
    tokensUsed?: boolean
    runsUsed?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenBudget"]>

  export type TokenBudgetSelectScalar = {
    id?: boolean
    userId?: boolean
    periodStart?: boolean
    tokensUsed?: boolean
    runsUsed?: boolean
  }

  export type TokenBudgetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "periodStart" | "tokensUsed" | "runsUsed", ExtArgs["result"]["tokenBudget"]>
  export type TokenBudgetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TokenBudgetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TokenBudgetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TokenBudgetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TokenBudget"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      periodStart: Date
      tokensUsed: number
      runsUsed: number
    }, ExtArgs["result"]["tokenBudget"]>
    composites: {}
  }

  type TokenBudgetGetPayload<S extends boolean | null | undefined | TokenBudgetDefaultArgs> = $Result.GetResult<Prisma.$TokenBudgetPayload, S>

  type TokenBudgetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TokenBudgetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TokenBudgetCountAggregateInputType | true
    }

  export interface TokenBudgetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TokenBudget'], meta: { name: 'TokenBudget' } }
    /**
     * Find zero or one TokenBudget that matches the filter.
     * @param {TokenBudgetFindUniqueArgs} args - Arguments to find a TokenBudget
     * @example
     * // Get one TokenBudget
     * const tokenBudget = await prisma.tokenBudget.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TokenBudgetFindUniqueArgs>(args: SelectSubset<T, TokenBudgetFindUniqueArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TokenBudget that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TokenBudgetFindUniqueOrThrowArgs} args - Arguments to find a TokenBudget
     * @example
     * // Get one TokenBudget
     * const tokenBudget = await prisma.tokenBudget.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TokenBudgetFindUniqueOrThrowArgs>(args: SelectSubset<T, TokenBudgetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TokenBudget that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetFindFirstArgs} args - Arguments to find a TokenBudget
     * @example
     * // Get one TokenBudget
     * const tokenBudget = await prisma.tokenBudget.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TokenBudgetFindFirstArgs>(args?: SelectSubset<T, TokenBudgetFindFirstArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TokenBudget that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetFindFirstOrThrowArgs} args - Arguments to find a TokenBudget
     * @example
     * // Get one TokenBudget
     * const tokenBudget = await prisma.tokenBudget.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TokenBudgetFindFirstOrThrowArgs>(args?: SelectSubset<T, TokenBudgetFindFirstOrThrowArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TokenBudgets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TokenBudgets
     * const tokenBudgets = await prisma.tokenBudget.findMany()
     * 
     * // Get first 10 TokenBudgets
     * const tokenBudgets = await prisma.tokenBudget.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tokenBudgetWithIdOnly = await prisma.tokenBudget.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TokenBudgetFindManyArgs>(args?: SelectSubset<T, TokenBudgetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TokenBudget.
     * @param {TokenBudgetCreateArgs} args - Arguments to create a TokenBudget.
     * @example
     * // Create one TokenBudget
     * const TokenBudget = await prisma.tokenBudget.create({
     *   data: {
     *     // ... data to create a TokenBudget
     *   }
     * })
     * 
     */
    create<T extends TokenBudgetCreateArgs>(args: SelectSubset<T, TokenBudgetCreateArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TokenBudgets.
     * @param {TokenBudgetCreateManyArgs} args - Arguments to create many TokenBudgets.
     * @example
     * // Create many TokenBudgets
     * const tokenBudget = await prisma.tokenBudget.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TokenBudgetCreateManyArgs>(args?: SelectSubset<T, TokenBudgetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TokenBudgets and returns the data saved in the database.
     * @param {TokenBudgetCreateManyAndReturnArgs} args - Arguments to create many TokenBudgets.
     * @example
     * // Create many TokenBudgets
     * const tokenBudget = await prisma.tokenBudget.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TokenBudgets and only return the `id`
     * const tokenBudgetWithIdOnly = await prisma.tokenBudget.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TokenBudgetCreateManyAndReturnArgs>(args?: SelectSubset<T, TokenBudgetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TokenBudget.
     * @param {TokenBudgetDeleteArgs} args - Arguments to delete one TokenBudget.
     * @example
     * // Delete one TokenBudget
     * const TokenBudget = await prisma.tokenBudget.delete({
     *   where: {
     *     // ... filter to delete one TokenBudget
     *   }
     * })
     * 
     */
    delete<T extends TokenBudgetDeleteArgs>(args: SelectSubset<T, TokenBudgetDeleteArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TokenBudget.
     * @param {TokenBudgetUpdateArgs} args - Arguments to update one TokenBudget.
     * @example
     * // Update one TokenBudget
     * const tokenBudget = await prisma.tokenBudget.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TokenBudgetUpdateArgs>(args: SelectSubset<T, TokenBudgetUpdateArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TokenBudgets.
     * @param {TokenBudgetDeleteManyArgs} args - Arguments to filter TokenBudgets to delete.
     * @example
     * // Delete a few TokenBudgets
     * const { count } = await prisma.tokenBudget.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TokenBudgetDeleteManyArgs>(args?: SelectSubset<T, TokenBudgetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TokenBudgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TokenBudgets
     * const tokenBudget = await prisma.tokenBudget.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TokenBudgetUpdateManyArgs>(args: SelectSubset<T, TokenBudgetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TokenBudgets and returns the data updated in the database.
     * @param {TokenBudgetUpdateManyAndReturnArgs} args - Arguments to update many TokenBudgets.
     * @example
     * // Update many TokenBudgets
     * const tokenBudget = await prisma.tokenBudget.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TokenBudgets and only return the `id`
     * const tokenBudgetWithIdOnly = await prisma.tokenBudget.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TokenBudgetUpdateManyAndReturnArgs>(args: SelectSubset<T, TokenBudgetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TokenBudget.
     * @param {TokenBudgetUpsertArgs} args - Arguments to update or create a TokenBudget.
     * @example
     * // Update or create a TokenBudget
     * const tokenBudget = await prisma.tokenBudget.upsert({
     *   create: {
     *     // ... data to create a TokenBudget
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TokenBudget we want to update
     *   }
     * })
     */
    upsert<T extends TokenBudgetUpsertArgs>(args: SelectSubset<T, TokenBudgetUpsertArgs<ExtArgs>>): Prisma__TokenBudgetClient<$Result.GetResult<Prisma.$TokenBudgetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TokenBudgets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetCountArgs} args - Arguments to filter TokenBudgets to count.
     * @example
     * // Count the number of TokenBudgets
     * const count = await prisma.tokenBudget.count({
     *   where: {
     *     // ... the filter for the TokenBudgets we want to count
     *   }
     * })
    **/
    count<T extends TokenBudgetCountArgs>(
      args?: Subset<T, TokenBudgetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TokenBudgetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TokenBudget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TokenBudgetAggregateArgs>(args: Subset<T, TokenBudgetAggregateArgs>): Prisma.PrismaPromise<GetTokenBudgetAggregateType<T>>

    /**
     * Group by TokenBudget.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenBudgetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TokenBudgetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TokenBudgetGroupByArgs['orderBy'] }
        : { orderBy?: TokenBudgetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TokenBudgetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTokenBudgetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TokenBudget model
   */
  readonly fields: TokenBudgetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TokenBudget.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TokenBudgetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TokenBudget model
   */
  interface TokenBudgetFieldRefs {
    readonly id: FieldRef<"TokenBudget", 'String'>
    readonly userId: FieldRef<"TokenBudget", 'String'>
    readonly periodStart: FieldRef<"TokenBudget", 'DateTime'>
    readonly tokensUsed: FieldRef<"TokenBudget", 'Int'>
    readonly runsUsed: FieldRef<"TokenBudget", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * TokenBudget findUnique
   */
  export type TokenBudgetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * Filter, which TokenBudget to fetch.
     */
    where: TokenBudgetWhereUniqueInput
  }

  /**
   * TokenBudget findUniqueOrThrow
   */
  export type TokenBudgetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * Filter, which TokenBudget to fetch.
     */
    where: TokenBudgetWhereUniqueInput
  }

  /**
   * TokenBudget findFirst
   */
  export type TokenBudgetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * Filter, which TokenBudget to fetch.
     */
    where?: TokenBudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenBudgets to fetch.
     */
    orderBy?: TokenBudgetOrderByWithRelationInput | TokenBudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenBudgets.
     */
    cursor?: TokenBudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenBudgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenBudgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenBudgets.
     */
    distinct?: TokenBudgetScalarFieldEnum | TokenBudgetScalarFieldEnum[]
  }

  /**
   * TokenBudget findFirstOrThrow
   */
  export type TokenBudgetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * Filter, which TokenBudget to fetch.
     */
    where?: TokenBudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenBudgets to fetch.
     */
    orderBy?: TokenBudgetOrderByWithRelationInput | TokenBudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenBudgets.
     */
    cursor?: TokenBudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenBudgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenBudgets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenBudgets.
     */
    distinct?: TokenBudgetScalarFieldEnum | TokenBudgetScalarFieldEnum[]
  }

  /**
   * TokenBudget findMany
   */
  export type TokenBudgetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * Filter, which TokenBudgets to fetch.
     */
    where?: TokenBudgetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenBudgets to fetch.
     */
    orderBy?: TokenBudgetOrderByWithRelationInput | TokenBudgetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TokenBudgets.
     */
    cursor?: TokenBudgetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenBudgets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenBudgets.
     */
    skip?: number
    distinct?: TokenBudgetScalarFieldEnum | TokenBudgetScalarFieldEnum[]
  }

  /**
   * TokenBudget create
   */
  export type TokenBudgetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * The data needed to create a TokenBudget.
     */
    data: XOR<TokenBudgetCreateInput, TokenBudgetUncheckedCreateInput>
  }

  /**
   * TokenBudget createMany
   */
  export type TokenBudgetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TokenBudgets.
     */
    data: TokenBudgetCreateManyInput | TokenBudgetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TokenBudget createManyAndReturn
   */
  export type TokenBudgetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * The data used to create many TokenBudgets.
     */
    data: TokenBudgetCreateManyInput | TokenBudgetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TokenBudget update
   */
  export type TokenBudgetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * The data needed to update a TokenBudget.
     */
    data: XOR<TokenBudgetUpdateInput, TokenBudgetUncheckedUpdateInput>
    /**
     * Choose, which TokenBudget to update.
     */
    where: TokenBudgetWhereUniqueInput
  }

  /**
   * TokenBudget updateMany
   */
  export type TokenBudgetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TokenBudgets.
     */
    data: XOR<TokenBudgetUpdateManyMutationInput, TokenBudgetUncheckedUpdateManyInput>
    /**
     * Filter which TokenBudgets to update
     */
    where?: TokenBudgetWhereInput
    /**
     * Limit how many TokenBudgets to update.
     */
    limit?: number
  }

  /**
   * TokenBudget updateManyAndReturn
   */
  export type TokenBudgetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * The data used to update TokenBudgets.
     */
    data: XOR<TokenBudgetUpdateManyMutationInput, TokenBudgetUncheckedUpdateManyInput>
    /**
     * Filter which TokenBudgets to update
     */
    where?: TokenBudgetWhereInput
    /**
     * Limit how many TokenBudgets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TokenBudget upsert
   */
  export type TokenBudgetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * The filter to search for the TokenBudget to update in case it exists.
     */
    where: TokenBudgetWhereUniqueInput
    /**
     * In case the TokenBudget found by the `where` argument doesn't exist, create a new TokenBudget with this data.
     */
    create: XOR<TokenBudgetCreateInput, TokenBudgetUncheckedCreateInput>
    /**
     * In case the TokenBudget was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TokenBudgetUpdateInput, TokenBudgetUncheckedUpdateInput>
  }

  /**
   * TokenBudget delete
   */
  export type TokenBudgetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
    /**
     * Filter which TokenBudget to delete.
     */
    where: TokenBudgetWhereUniqueInput
  }

  /**
   * TokenBudget deleteMany
   */
  export type TokenBudgetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenBudgets to delete
     */
    where?: TokenBudgetWhereInput
    /**
     * Limit how many TokenBudgets to delete.
     */
    limit?: number
  }

  /**
   * TokenBudget without action
   */
  export type TokenBudgetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenBudget
     */
    select?: TokenBudgetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TokenBudget
     */
    omit?: TokenBudgetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenBudgetInclude<ExtArgs> | null
  }


  /**
   * Model AnalyticsEvent
   */

  export type AggregateAnalyticsEvent = {
    _count: AnalyticsEventCountAggregateOutputType | null
    _min: AnalyticsEventMinAggregateOutputType | null
    _max: AnalyticsEventMaxAggregateOutputType | null
  }

  export type AnalyticsEventMinAggregateOutputType = {
    id: string | null
    userId: string | null
    eventType: string | null
    createdAt: Date | null
  }

  export type AnalyticsEventMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    eventType: string | null
    createdAt: Date | null
  }

  export type AnalyticsEventCountAggregateOutputType = {
    id: number
    userId: number
    eventType: number
    payload: number
    createdAt: number
    _all: number
  }


  export type AnalyticsEventMinAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    createdAt?: true
  }

  export type AnalyticsEventMaxAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    createdAt?: true
  }

  export type AnalyticsEventCountAggregateInputType = {
    id?: true
    userId?: true
    eventType?: true
    payload?: true
    createdAt?: true
    _all?: true
  }

  export type AnalyticsEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnalyticsEvent to aggregate.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AnalyticsEvents
    **/
    _count?: true | AnalyticsEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnalyticsEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnalyticsEventMaxAggregateInputType
  }

  export type GetAnalyticsEventAggregateType<T extends AnalyticsEventAggregateArgs> = {
        [P in keyof T & keyof AggregateAnalyticsEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnalyticsEvent[P]>
      : GetScalarType<T[P], AggregateAnalyticsEvent[P]>
  }




  export type AnalyticsEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnalyticsEventWhereInput
    orderBy?: AnalyticsEventOrderByWithAggregationInput | AnalyticsEventOrderByWithAggregationInput[]
    by: AnalyticsEventScalarFieldEnum[] | AnalyticsEventScalarFieldEnum
    having?: AnalyticsEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnalyticsEventCountAggregateInputType | true
    _min?: AnalyticsEventMinAggregateInputType
    _max?: AnalyticsEventMaxAggregateInputType
  }

  export type AnalyticsEventGroupByOutputType = {
    id: string
    userId: string | null
    eventType: string
    payload: JsonValue
    createdAt: Date
    _count: AnalyticsEventCountAggregateOutputType | null
    _min: AnalyticsEventMinAggregateOutputType | null
    _max: AnalyticsEventMaxAggregateOutputType | null
  }

  type GetAnalyticsEventGroupByPayload<T extends AnalyticsEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnalyticsEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnalyticsEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnalyticsEventGroupByOutputType[P]>
            : GetScalarType<T[P], AnalyticsEventGroupByOutputType[P]>
        }
      >
    >


  export type AnalyticsEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>
  }, ExtArgs["result"]["analyticsEvent"]>

  export type AnalyticsEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>
  }, ExtArgs["result"]["analyticsEvent"]>

  export type AnalyticsEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>
  }, ExtArgs["result"]["analyticsEvent"]>

  export type AnalyticsEventSelectScalar = {
    id?: boolean
    userId?: boolean
    eventType?: boolean
    payload?: boolean
    createdAt?: boolean
  }

  export type AnalyticsEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "eventType" | "payload" | "createdAt", ExtArgs["result"]["analyticsEvent"]>
  export type AnalyticsEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>
  }
  export type AnalyticsEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>
  }
  export type AnalyticsEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AnalyticsEvent$userArgs<ExtArgs>
  }

  export type $AnalyticsEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnalyticsEvent"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      /**
       * Nullable — some events are system-level (ingestion jobs, etc.)
       */
      userId: string | null
      /**
       * Typed event name e.g. "user.signup", "agent.run.completed"
       */
      eventType: string
      /**
       * Event-specific payload. Schema varies by eventType — see docs/DATA.md
       */
      payload: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["analyticsEvent"]>
    composites: {}
  }

  type AnalyticsEventGetPayload<S extends boolean | null | undefined | AnalyticsEventDefaultArgs> = $Result.GetResult<Prisma.$AnalyticsEventPayload, S>

  type AnalyticsEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnalyticsEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnalyticsEventCountAggregateInputType | true
    }

  export interface AnalyticsEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AnalyticsEvent'], meta: { name: 'AnalyticsEvent' } }
    /**
     * Find zero or one AnalyticsEvent that matches the filter.
     * @param {AnalyticsEventFindUniqueArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnalyticsEventFindUniqueArgs>(args: SelectSubset<T, AnalyticsEventFindUniqueArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AnalyticsEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnalyticsEventFindUniqueOrThrowArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnalyticsEventFindUniqueOrThrowArgs>(args: SelectSubset<T, AnalyticsEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnalyticsEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindFirstArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnalyticsEventFindFirstArgs>(args?: SelectSubset<T, AnalyticsEventFindFirstArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnalyticsEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindFirstOrThrowArgs} args - Arguments to find a AnalyticsEvent
     * @example
     * // Get one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnalyticsEventFindFirstOrThrowArgs>(args?: SelectSubset<T, AnalyticsEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AnalyticsEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnalyticsEvents
     * const analyticsEvents = await prisma.analyticsEvent.findMany()
     * 
     * // Get first 10 AnalyticsEvents
     * const analyticsEvents = await prisma.analyticsEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnalyticsEventFindManyArgs>(args?: SelectSubset<T, AnalyticsEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AnalyticsEvent.
     * @param {AnalyticsEventCreateArgs} args - Arguments to create a AnalyticsEvent.
     * @example
     * // Create one AnalyticsEvent
     * const AnalyticsEvent = await prisma.analyticsEvent.create({
     *   data: {
     *     // ... data to create a AnalyticsEvent
     *   }
     * })
     * 
     */
    create<T extends AnalyticsEventCreateArgs>(args: SelectSubset<T, AnalyticsEventCreateArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AnalyticsEvents.
     * @param {AnalyticsEventCreateManyArgs} args - Arguments to create many AnalyticsEvents.
     * @example
     * // Create many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnalyticsEventCreateManyArgs>(args?: SelectSubset<T, AnalyticsEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AnalyticsEvents and returns the data saved in the database.
     * @param {AnalyticsEventCreateManyAndReturnArgs} args - Arguments to create many AnalyticsEvents.
     * @example
     * // Create many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AnalyticsEvents and only return the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnalyticsEventCreateManyAndReturnArgs>(args?: SelectSubset<T, AnalyticsEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AnalyticsEvent.
     * @param {AnalyticsEventDeleteArgs} args - Arguments to delete one AnalyticsEvent.
     * @example
     * // Delete one AnalyticsEvent
     * const AnalyticsEvent = await prisma.analyticsEvent.delete({
     *   where: {
     *     // ... filter to delete one AnalyticsEvent
     *   }
     * })
     * 
     */
    delete<T extends AnalyticsEventDeleteArgs>(args: SelectSubset<T, AnalyticsEventDeleteArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AnalyticsEvent.
     * @param {AnalyticsEventUpdateArgs} args - Arguments to update one AnalyticsEvent.
     * @example
     * // Update one AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnalyticsEventUpdateArgs>(args: SelectSubset<T, AnalyticsEventUpdateArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AnalyticsEvents.
     * @param {AnalyticsEventDeleteManyArgs} args - Arguments to filter AnalyticsEvents to delete.
     * @example
     * // Delete a few AnalyticsEvents
     * const { count } = await prisma.analyticsEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnalyticsEventDeleteManyArgs>(args?: SelectSubset<T, AnalyticsEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnalyticsEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnalyticsEventUpdateManyArgs>(args: SelectSubset<T, AnalyticsEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnalyticsEvents and returns the data updated in the database.
     * @param {AnalyticsEventUpdateManyAndReturnArgs} args - Arguments to update many AnalyticsEvents.
     * @example
     * // Update many AnalyticsEvents
     * const analyticsEvent = await prisma.analyticsEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AnalyticsEvents and only return the `id`
     * const analyticsEventWithIdOnly = await prisma.analyticsEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnalyticsEventUpdateManyAndReturnArgs>(args: SelectSubset<T, AnalyticsEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AnalyticsEvent.
     * @param {AnalyticsEventUpsertArgs} args - Arguments to update or create a AnalyticsEvent.
     * @example
     * // Update or create a AnalyticsEvent
     * const analyticsEvent = await prisma.analyticsEvent.upsert({
     *   create: {
     *     // ... data to create a AnalyticsEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnalyticsEvent we want to update
     *   }
     * })
     */
    upsert<T extends AnalyticsEventUpsertArgs>(args: SelectSubset<T, AnalyticsEventUpsertArgs<ExtArgs>>): Prisma__AnalyticsEventClient<$Result.GetResult<Prisma.$AnalyticsEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AnalyticsEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventCountArgs} args - Arguments to filter AnalyticsEvents to count.
     * @example
     * // Count the number of AnalyticsEvents
     * const count = await prisma.analyticsEvent.count({
     *   where: {
     *     // ... the filter for the AnalyticsEvents we want to count
     *   }
     * })
    **/
    count<T extends AnalyticsEventCountArgs>(
      args?: Subset<T, AnalyticsEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnalyticsEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AnalyticsEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnalyticsEventAggregateArgs>(args: Subset<T, AnalyticsEventAggregateArgs>): Prisma.PrismaPromise<GetAnalyticsEventAggregateType<T>>

    /**
     * Group by AnalyticsEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnalyticsEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnalyticsEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnalyticsEventGroupByArgs['orderBy'] }
        : { orderBy?: AnalyticsEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnalyticsEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnalyticsEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AnalyticsEvent model
   */
  readonly fields: AnalyticsEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnalyticsEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnalyticsEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends AnalyticsEvent$userArgs<ExtArgs> = {}>(args?: Subset<T, AnalyticsEvent$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AnalyticsEvent model
   */
  interface AnalyticsEventFieldRefs {
    readonly id: FieldRef<"AnalyticsEvent", 'String'>
    readonly userId: FieldRef<"AnalyticsEvent", 'String'>
    readonly eventType: FieldRef<"AnalyticsEvent", 'String'>
    readonly payload: FieldRef<"AnalyticsEvent", 'Json'>
    readonly createdAt: FieldRef<"AnalyticsEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AnalyticsEvent findUnique
   */
  export type AnalyticsEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent findUniqueOrThrow
   */
  export type AnalyticsEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent findFirst
   */
  export type AnalyticsEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnalyticsEvents.
     */
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * AnalyticsEvent findFirstOrThrow
   */
  export type AnalyticsEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvent to fetch.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnalyticsEvents.
     */
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * AnalyticsEvent findMany
   */
  export type AnalyticsEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * Filter, which AnalyticsEvents to fetch.
     */
    where?: AnalyticsEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnalyticsEvents to fetch.
     */
    orderBy?: AnalyticsEventOrderByWithRelationInput | AnalyticsEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AnalyticsEvents.
     */
    cursor?: AnalyticsEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnalyticsEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnalyticsEvents.
     */
    skip?: number
    distinct?: AnalyticsEventScalarFieldEnum | AnalyticsEventScalarFieldEnum[]
  }

  /**
   * AnalyticsEvent create
   */
  export type AnalyticsEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * The data needed to create a AnalyticsEvent.
     */
    data: XOR<AnalyticsEventCreateInput, AnalyticsEventUncheckedCreateInput>
  }

  /**
   * AnalyticsEvent createMany
   */
  export type AnalyticsEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnalyticsEvents.
     */
    data: AnalyticsEventCreateManyInput | AnalyticsEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AnalyticsEvent createManyAndReturn
   */
  export type AnalyticsEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * The data used to create many AnalyticsEvents.
     */
    data: AnalyticsEventCreateManyInput | AnalyticsEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnalyticsEvent update
   */
  export type AnalyticsEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * The data needed to update a AnalyticsEvent.
     */
    data: XOR<AnalyticsEventUpdateInput, AnalyticsEventUncheckedUpdateInput>
    /**
     * Choose, which AnalyticsEvent to update.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent updateMany
   */
  export type AnalyticsEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnalyticsEvents.
     */
    data: XOR<AnalyticsEventUpdateManyMutationInput, AnalyticsEventUncheckedUpdateManyInput>
    /**
     * Filter which AnalyticsEvents to update
     */
    where?: AnalyticsEventWhereInput
    /**
     * Limit how many AnalyticsEvents to update.
     */
    limit?: number
  }

  /**
   * AnalyticsEvent updateManyAndReturn
   */
  export type AnalyticsEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * The data used to update AnalyticsEvents.
     */
    data: XOR<AnalyticsEventUpdateManyMutationInput, AnalyticsEventUncheckedUpdateManyInput>
    /**
     * Filter which AnalyticsEvents to update
     */
    where?: AnalyticsEventWhereInput
    /**
     * Limit how many AnalyticsEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnalyticsEvent upsert
   */
  export type AnalyticsEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * The filter to search for the AnalyticsEvent to update in case it exists.
     */
    where: AnalyticsEventWhereUniqueInput
    /**
     * In case the AnalyticsEvent found by the `where` argument doesn't exist, create a new AnalyticsEvent with this data.
     */
    create: XOR<AnalyticsEventCreateInput, AnalyticsEventUncheckedCreateInput>
    /**
     * In case the AnalyticsEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnalyticsEventUpdateInput, AnalyticsEventUncheckedUpdateInput>
  }

  /**
   * AnalyticsEvent delete
   */
  export type AnalyticsEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
    /**
     * Filter which AnalyticsEvent to delete.
     */
    where: AnalyticsEventWhereUniqueInput
  }

  /**
   * AnalyticsEvent deleteMany
   */
  export type AnalyticsEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnalyticsEvents to delete
     */
    where?: AnalyticsEventWhereInput
    /**
     * Limit how many AnalyticsEvents to delete.
     */
    limit?: number
  }

  /**
   * AnalyticsEvent.user
   */
  export type AnalyticsEvent$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * AnalyticsEvent without action
   */
  export type AnalyticsEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnalyticsEvent
     */
    select?: AnalyticsEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnalyticsEvent
     */
    omit?: AnalyticsEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnalyticsEventInclude<ExtArgs> | null
  }


  /**
   * Model Player
   */

  export type AggregatePlayer = {
    _count: PlayerCountAggregateOutputType | null
    _avg: PlayerAvgAggregateOutputType | null
    _sum: PlayerSumAggregateOutputType | null
    _min: PlayerMinAggregateOutputType | null
    _max: PlayerMaxAggregateOutputType | null
  }

  export type PlayerAvgAggregateOutputType = {
    depthChartOrder: number | null
    searchRank: number | null
    age: number | null
    yearsExp: number | null
  }

  export type PlayerSumAggregateOutputType = {
    depthChartOrder: number | null
    searchRank: number | null
    age: number | null
    yearsExp: number | null
  }

  export type PlayerMinAggregateOutputType = {
    sleeperId: string | null
    firstName: string | null
    lastName: string | null
    position: string | null
    team: string | null
    status: string | null
    injuryStatus: string | null
    practiceParticipation: string | null
    depthChartPosition: string | null
    depthChartOrder: number | null
    searchRank: number | null
    age: number | null
    yearsExp: number | null
    lastRefreshedAt: Date | null
  }

  export type PlayerMaxAggregateOutputType = {
    sleeperId: string | null
    firstName: string | null
    lastName: string | null
    position: string | null
    team: string | null
    status: string | null
    injuryStatus: string | null
    practiceParticipation: string | null
    depthChartPosition: string | null
    depthChartOrder: number | null
    searchRank: number | null
    age: number | null
    yearsExp: number | null
    lastRefreshedAt: Date | null
  }

  export type PlayerCountAggregateOutputType = {
    sleeperId: number
    firstName: number
    lastName: number
    position: number
    team: number
    status: number
    injuryStatus: number
    practiceParticipation: number
    depthChartPosition: number
    depthChartOrder: number
    searchRank: number
    age: number
    yearsExp: number
    metadata: number
    lastRefreshedAt: number
    _all: number
  }


  export type PlayerAvgAggregateInputType = {
    depthChartOrder?: true
    searchRank?: true
    age?: true
    yearsExp?: true
  }

  export type PlayerSumAggregateInputType = {
    depthChartOrder?: true
    searchRank?: true
    age?: true
    yearsExp?: true
  }

  export type PlayerMinAggregateInputType = {
    sleeperId?: true
    firstName?: true
    lastName?: true
    position?: true
    team?: true
    status?: true
    injuryStatus?: true
    practiceParticipation?: true
    depthChartPosition?: true
    depthChartOrder?: true
    searchRank?: true
    age?: true
    yearsExp?: true
    lastRefreshedAt?: true
  }

  export type PlayerMaxAggregateInputType = {
    sleeperId?: true
    firstName?: true
    lastName?: true
    position?: true
    team?: true
    status?: true
    injuryStatus?: true
    practiceParticipation?: true
    depthChartPosition?: true
    depthChartOrder?: true
    searchRank?: true
    age?: true
    yearsExp?: true
    lastRefreshedAt?: true
  }

  export type PlayerCountAggregateInputType = {
    sleeperId?: true
    firstName?: true
    lastName?: true
    position?: true
    team?: true
    status?: true
    injuryStatus?: true
    practiceParticipation?: true
    depthChartPosition?: true
    depthChartOrder?: true
    searchRank?: true
    age?: true
    yearsExp?: true
    metadata?: true
    lastRefreshedAt?: true
    _all?: true
  }

  export type PlayerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Player to aggregate.
     */
    where?: PlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Players from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Players.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Players
    **/
    _count?: true | PlayerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlayerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlayerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlayerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlayerMaxAggregateInputType
  }

  export type GetPlayerAggregateType<T extends PlayerAggregateArgs> = {
        [P in keyof T & keyof AggregatePlayer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlayer[P]>
      : GetScalarType<T[P], AggregatePlayer[P]>
  }




  export type PlayerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlayerWhereInput
    orderBy?: PlayerOrderByWithAggregationInput | PlayerOrderByWithAggregationInput[]
    by: PlayerScalarFieldEnum[] | PlayerScalarFieldEnum
    having?: PlayerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlayerCountAggregateInputType | true
    _avg?: PlayerAvgAggregateInputType
    _sum?: PlayerSumAggregateInputType
    _min?: PlayerMinAggregateInputType
    _max?: PlayerMaxAggregateInputType
  }

  export type PlayerGroupByOutputType = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team: string | null
    status: string
    injuryStatus: string | null
    practiceParticipation: string | null
    depthChartPosition: string | null
    depthChartOrder: number | null
    searchRank: number | null
    age: number | null
    yearsExp: number | null
    metadata: JsonValue
    lastRefreshedAt: Date
    _count: PlayerCountAggregateOutputType | null
    _avg: PlayerAvgAggregateOutputType | null
    _sum: PlayerSumAggregateOutputType | null
    _min: PlayerMinAggregateOutputType | null
    _max: PlayerMaxAggregateOutputType | null
  }

  type GetPlayerGroupByPayload<T extends PlayerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlayerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlayerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlayerGroupByOutputType[P]>
            : GetScalarType<T[P], PlayerGroupByOutputType[P]>
        }
      >
    >


  export type PlayerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sleeperId?: boolean
    firstName?: boolean
    lastName?: boolean
    position?: boolean
    team?: boolean
    status?: boolean
    injuryStatus?: boolean
    practiceParticipation?: boolean
    depthChartPosition?: boolean
    depthChartOrder?: boolean
    searchRank?: boolean
    age?: boolean
    yearsExp?: boolean
    metadata?: boolean
    lastRefreshedAt?: boolean
    rankings?: boolean | Player$rankingsArgs<ExtArgs>
    trending?: boolean | Player$trendingArgs<ExtArgs>
    _count?: boolean | PlayerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["player"]>

  export type PlayerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sleeperId?: boolean
    firstName?: boolean
    lastName?: boolean
    position?: boolean
    team?: boolean
    status?: boolean
    injuryStatus?: boolean
    practiceParticipation?: boolean
    depthChartPosition?: boolean
    depthChartOrder?: boolean
    searchRank?: boolean
    age?: boolean
    yearsExp?: boolean
    metadata?: boolean
    lastRefreshedAt?: boolean
  }, ExtArgs["result"]["player"]>

  export type PlayerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sleeperId?: boolean
    firstName?: boolean
    lastName?: boolean
    position?: boolean
    team?: boolean
    status?: boolean
    injuryStatus?: boolean
    practiceParticipation?: boolean
    depthChartPosition?: boolean
    depthChartOrder?: boolean
    searchRank?: boolean
    age?: boolean
    yearsExp?: boolean
    metadata?: boolean
    lastRefreshedAt?: boolean
  }, ExtArgs["result"]["player"]>

  export type PlayerSelectScalar = {
    sleeperId?: boolean
    firstName?: boolean
    lastName?: boolean
    position?: boolean
    team?: boolean
    status?: boolean
    injuryStatus?: boolean
    practiceParticipation?: boolean
    depthChartPosition?: boolean
    depthChartOrder?: boolean
    searchRank?: boolean
    age?: boolean
    yearsExp?: boolean
    metadata?: boolean
    lastRefreshedAt?: boolean
  }

  export type PlayerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"sleeperId" | "firstName" | "lastName" | "position" | "team" | "status" | "injuryStatus" | "practiceParticipation" | "depthChartPosition" | "depthChartOrder" | "searchRank" | "age" | "yearsExp" | "metadata" | "lastRefreshedAt", ExtArgs["result"]["player"]>
  export type PlayerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rankings?: boolean | Player$rankingsArgs<ExtArgs>
    trending?: boolean | Player$trendingArgs<ExtArgs>
    _count?: boolean | PlayerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PlayerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PlayerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PlayerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Player"
    objects: {
      rankings: Prisma.$PlayerRankingPayload<ExtArgs>[]
      trending: Prisma.$TrendingPlayerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      sleeperId: string
      firstName: string
      lastName: string
      position: string
      team: string | null
      /**
       * Active, Injured Reserve, PUP, etc.
       */
      status: string
      /**
       * Questionable, Doubtful, Out, IR — null if healthy
       */
      injuryStatus: string | null
      /**
       * Full, Limited, Did Not Practice — null if no report
       */
      practiceParticipation: string | null
      /**
       * e.g. "QB1", "RB2"
       */
      depthChartPosition: string | null
      /**
       * 1 = starter, 2 = backup — lower is better
       */
      depthChartOrder: number | null
      /**
       * Sleeper's built-in rough ranking across all players
       */
      searchRank: number | null
      age: number | null
      yearsExp: number | null
      /**
       * Full raw Sleeper player object — preserved for future use
       */
      metadata: Prisma.JsonValue
      lastRefreshedAt: Date
    }, ExtArgs["result"]["player"]>
    composites: {}
  }

  type PlayerGetPayload<S extends boolean | null | undefined | PlayerDefaultArgs> = $Result.GetResult<Prisma.$PlayerPayload, S>

  type PlayerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlayerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlayerCountAggregateInputType | true
    }

  export interface PlayerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Player'], meta: { name: 'Player' } }
    /**
     * Find zero or one Player that matches the filter.
     * @param {PlayerFindUniqueArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerFindUniqueArgs>(args: SelectSubset<T, PlayerFindUniqueArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Player that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlayerFindUniqueOrThrowArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerFindUniqueOrThrowArgs>(args: SelectSubset<T, PlayerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Player that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerFindFirstArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerFindFirstArgs>(args?: SelectSubset<T, PlayerFindFirstArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Player that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerFindFirstOrThrowArgs} args - Arguments to find a Player
     * @example
     * // Get one Player
     * const player = await prisma.player.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerFindFirstOrThrowArgs>(args?: SelectSubset<T, PlayerFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Players that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Players
     * const players = await prisma.player.findMany()
     * 
     * // Get first 10 Players
     * const players = await prisma.player.findMany({ take: 10 })
     * 
     * // Only select the `sleeperId`
     * const playerWithSleeperIdOnly = await prisma.player.findMany({ select: { sleeperId: true } })
     * 
     */
    findMany<T extends PlayerFindManyArgs>(args?: SelectSubset<T, PlayerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Player.
     * @param {PlayerCreateArgs} args - Arguments to create a Player.
     * @example
     * // Create one Player
     * const Player = await prisma.player.create({
     *   data: {
     *     // ... data to create a Player
     *   }
     * })
     * 
     */
    create<T extends PlayerCreateArgs>(args: SelectSubset<T, PlayerCreateArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Players.
     * @param {PlayerCreateManyArgs} args - Arguments to create many Players.
     * @example
     * // Create many Players
     * const player = await prisma.player.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlayerCreateManyArgs>(args?: SelectSubset<T, PlayerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Players and returns the data saved in the database.
     * @param {PlayerCreateManyAndReturnArgs} args - Arguments to create many Players.
     * @example
     * // Create many Players
     * const player = await prisma.player.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Players and only return the `sleeperId`
     * const playerWithSleeperIdOnly = await prisma.player.createManyAndReturn({
     *   select: { sleeperId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlayerCreateManyAndReturnArgs>(args?: SelectSubset<T, PlayerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Player.
     * @param {PlayerDeleteArgs} args - Arguments to delete one Player.
     * @example
     * // Delete one Player
     * const Player = await prisma.player.delete({
     *   where: {
     *     // ... filter to delete one Player
     *   }
     * })
     * 
     */
    delete<T extends PlayerDeleteArgs>(args: SelectSubset<T, PlayerDeleteArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Player.
     * @param {PlayerUpdateArgs} args - Arguments to update one Player.
     * @example
     * // Update one Player
     * const player = await prisma.player.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlayerUpdateArgs>(args: SelectSubset<T, PlayerUpdateArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Players.
     * @param {PlayerDeleteManyArgs} args - Arguments to filter Players to delete.
     * @example
     * // Delete a few Players
     * const { count } = await prisma.player.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlayerDeleteManyArgs>(args?: SelectSubset<T, PlayerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Players.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Players
     * const player = await prisma.player.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlayerUpdateManyArgs>(args: SelectSubset<T, PlayerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Players and returns the data updated in the database.
     * @param {PlayerUpdateManyAndReturnArgs} args - Arguments to update many Players.
     * @example
     * // Update many Players
     * const player = await prisma.player.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Players and only return the `sleeperId`
     * const playerWithSleeperIdOnly = await prisma.player.updateManyAndReturn({
     *   select: { sleeperId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PlayerUpdateManyAndReturnArgs>(args: SelectSubset<T, PlayerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Player.
     * @param {PlayerUpsertArgs} args - Arguments to update or create a Player.
     * @example
     * // Update or create a Player
     * const player = await prisma.player.upsert({
     *   create: {
     *     // ... data to create a Player
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Player we want to update
     *   }
     * })
     */
    upsert<T extends PlayerUpsertArgs>(args: SelectSubset<T, PlayerUpsertArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Players.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerCountArgs} args - Arguments to filter Players to count.
     * @example
     * // Count the number of Players
     * const count = await prisma.player.count({
     *   where: {
     *     // ... the filter for the Players we want to count
     *   }
     * })
    **/
    count<T extends PlayerCountArgs>(
      args?: Subset<T, PlayerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlayerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Player.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlayerAggregateArgs>(args: Subset<T, PlayerAggregateArgs>): Prisma.PrismaPromise<GetPlayerAggregateType<T>>

    /**
     * Group by Player.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlayerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlayerGroupByArgs['orderBy'] }
        : { orderBy?: PlayerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlayerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlayerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Player model
   */
  readonly fields: PlayerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Player.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlayerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    rankings<T extends Player$rankingsArgs<ExtArgs> = {}>(args?: Subset<T, Player$rankingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    trending<T extends Player$trendingArgs<ExtArgs> = {}>(args?: Subset<T, Player$trendingArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Player model
   */
  interface PlayerFieldRefs {
    readonly sleeperId: FieldRef<"Player", 'String'>
    readonly firstName: FieldRef<"Player", 'String'>
    readonly lastName: FieldRef<"Player", 'String'>
    readonly position: FieldRef<"Player", 'String'>
    readonly team: FieldRef<"Player", 'String'>
    readonly status: FieldRef<"Player", 'String'>
    readonly injuryStatus: FieldRef<"Player", 'String'>
    readonly practiceParticipation: FieldRef<"Player", 'String'>
    readonly depthChartPosition: FieldRef<"Player", 'String'>
    readonly depthChartOrder: FieldRef<"Player", 'Int'>
    readonly searchRank: FieldRef<"Player", 'Int'>
    readonly age: FieldRef<"Player", 'Int'>
    readonly yearsExp: FieldRef<"Player", 'Int'>
    readonly metadata: FieldRef<"Player", 'Json'>
    readonly lastRefreshedAt: FieldRef<"Player", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Player findUnique
   */
  export type PlayerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * Filter, which Player to fetch.
     */
    where: PlayerWhereUniqueInput
  }

  /**
   * Player findUniqueOrThrow
   */
  export type PlayerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * Filter, which Player to fetch.
     */
    where: PlayerWhereUniqueInput
  }

  /**
   * Player findFirst
   */
  export type PlayerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * Filter, which Player to fetch.
     */
    where?: PlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Players.
     */
    cursor?: PlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Players from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Players.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Players.
     */
    distinct?: PlayerScalarFieldEnum | PlayerScalarFieldEnum[]
  }

  /**
   * Player findFirstOrThrow
   */
  export type PlayerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * Filter, which Player to fetch.
     */
    where?: PlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Players.
     */
    cursor?: PlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Players from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Players.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Players.
     */
    distinct?: PlayerScalarFieldEnum | PlayerScalarFieldEnum[]
  }

  /**
   * Player findMany
   */
  export type PlayerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * Filter, which Players to fetch.
     */
    where?: PlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Players to fetch.
     */
    orderBy?: PlayerOrderByWithRelationInput | PlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Players.
     */
    cursor?: PlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Players from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Players.
     */
    skip?: number
    distinct?: PlayerScalarFieldEnum | PlayerScalarFieldEnum[]
  }

  /**
   * Player create
   */
  export type PlayerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * The data needed to create a Player.
     */
    data: XOR<PlayerCreateInput, PlayerUncheckedCreateInput>
  }

  /**
   * Player createMany
   */
  export type PlayerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Players.
     */
    data: PlayerCreateManyInput | PlayerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Player createManyAndReturn
   */
  export type PlayerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * The data used to create many Players.
     */
    data: PlayerCreateManyInput | PlayerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Player update
   */
  export type PlayerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * The data needed to update a Player.
     */
    data: XOR<PlayerUpdateInput, PlayerUncheckedUpdateInput>
    /**
     * Choose, which Player to update.
     */
    where: PlayerWhereUniqueInput
  }

  /**
   * Player updateMany
   */
  export type PlayerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Players.
     */
    data: XOR<PlayerUpdateManyMutationInput, PlayerUncheckedUpdateManyInput>
    /**
     * Filter which Players to update
     */
    where?: PlayerWhereInput
    /**
     * Limit how many Players to update.
     */
    limit?: number
  }

  /**
   * Player updateManyAndReturn
   */
  export type PlayerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * The data used to update Players.
     */
    data: XOR<PlayerUpdateManyMutationInput, PlayerUncheckedUpdateManyInput>
    /**
     * Filter which Players to update
     */
    where?: PlayerWhereInput
    /**
     * Limit how many Players to update.
     */
    limit?: number
  }

  /**
   * Player upsert
   */
  export type PlayerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * The filter to search for the Player to update in case it exists.
     */
    where: PlayerWhereUniqueInput
    /**
     * In case the Player found by the `where` argument doesn't exist, create a new Player with this data.
     */
    create: XOR<PlayerCreateInput, PlayerUncheckedCreateInput>
    /**
     * In case the Player was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlayerUpdateInput, PlayerUncheckedUpdateInput>
  }

  /**
   * Player delete
   */
  export type PlayerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
    /**
     * Filter which Player to delete.
     */
    where: PlayerWhereUniqueInput
  }

  /**
   * Player deleteMany
   */
  export type PlayerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Players to delete
     */
    where?: PlayerWhereInput
    /**
     * Limit how many Players to delete.
     */
    limit?: number
  }

  /**
   * Player.rankings
   */
  export type Player$rankingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    where?: PlayerRankingWhereInput
    orderBy?: PlayerRankingOrderByWithRelationInput | PlayerRankingOrderByWithRelationInput[]
    cursor?: PlayerRankingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlayerRankingScalarFieldEnum | PlayerRankingScalarFieldEnum[]
  }

  /**
   * Player.trending
   */
  export type Player$trendingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    where?: TrendingPlayerWhereInput
    orderBy?: TrendingPlayerOrderByWithRelationInput | TrendingPlayerOrderByWithRelationInput[]
    cursor?: TrendingPlayerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrendingPlayerScalarFieldEnum | TrendingPlayerScalarFieldEnum[]
  }

  /**
   * Player without action
   */
  export type PlayerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Player
     */
    select?: PlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Player
     */
    omit?: PlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerInclude<ExtArgs> | null
  }


  /**
   * Model PlayerRanking
   */

  export type AggregatePlayerRanking = {
    _count: PlayerRankingCountAggregateOutputType | null
    _avg: PlayerRankingAvgAggregateOutputType | null
    _sum: PlayerRankingSumAggregateOutputType | null
    _min: PlayerRankingMinAggregateOutputType | null
    _max: PlayerRankingMaxAggregateOutputType | null
  }

  export type PlayerRankingAvgAggregateOutputType = {
    rankOverall: number | null
    rankPosition: number | null
    week: number | null
    season: number | null
  }

  export type PlayerRankingSumAggregateOutputType = {
    rankOverall: number | null
    rankPosition: number | null
    week: number | null
    season: number | null
  }

  export type PlayerRankingMinAggregateOutputType = {
    id: string | null
    playerId: string | null
    source: string | null
    rankOverall: number | null
    rankPosition: number | null
    week: number | null
    season: number | null
    fetchedAt: Date | null
  }

  export type PlayerRankingMaxAggregateOutputType = {
    id: string | null
    playerId: string | null
    source: string | null
    rankOverall: number | null
    rankPosition: number | null
    week: number | null
    season: number | null
    fetchedAt: Date | null
  }

  export type PlayerRankingCountAggregateOutputType = {
    id: number
    playerId: number
    source: number
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt: number
    _all: number
  }


  export type PlayerRankingAvgAggregateInputType = {
    rankOverall?: true
    rankPosition?: true
    week?: true
    season?: true
  }

  export type PlayerRankingSumAggregateInputType = {
    rankOverall?: true
    rankPosition?: true
    week?: true
    season?: true
  }

  export type PlayerRankingMinAggregateInputType = {
    id?: true
    playerId?: true
    source?: true
    rankOverall?: true
    rankPosition?: true
    week?: true
    season?: true
    fetchedAt?: true
  }

  export type PlayerRankingMaxAggregateInputType = {
    id?: true
    playerId?: true
    source?: true
    rankOverall?: true
    rankPosition?: true
    week?: true
    season?: true
    fetchedAt?: true
  }

  export type PlayerRankingCountAggregateInputType = {
    id?: true
    playerId?: true
    source?: true
    rankOverall?: true
    rankPosition?: true
    week?: true
    season?: true
    fetchedAt?: true
    _all?: true
  }

  export type PlayerRankingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlayerRanking to aggregate.
     */
    where?: PlayerRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerRankings to fetch.
     */
    orderBy?: PlayerRankingOrderByWithRelationInput | PlayerRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlayerRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerRankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlayerRankings
    **/
    _count?: true | PlayerRankingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlayerRankingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlayerRankingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlayerRankingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlayerRankingMaxAggregateInputType
  }

  export type GetPlayerRankingAggregateType<T extends PlayerRankingAggregateArgs> = {
        [P in keyof T & keyof AggregatePlayerRanking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlayerRanking[P]>
      : GetScalarType<T[P], AggregatePlayerRanking[P]>
  }




  export type PlayerRankingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlayerRankingWhereInput
    orderBy?: PlayerRankingOrderByWithAggregationInput | PlayerRankingOrderByWithAggregationInput[]
    by: PlayerRankingScalarFieldEnum[] | PlayerRankingScalarFieldEnum
    having?: PlayerRankingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlayerRankingCountAggregateInputType | true
    _avg?: PlayerRankingAvgAggregateInputType
    _sum?: PlayerRankingSumAggregateInputType
    _min?: PlayerRankingMinAggregateInputType
    _max?: PlayerRankingMaxAggregateInputType
  }

  export type PlayerRankingGroupByOutputType = {
    id: string
    playerId: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt: Date
    _count: PlayerRankingCountAggregateOutputType | null
    _avg: PlayerRankingAvgAggregateOutputType | null
    _sum: PlayerRankingSumAggregateOutputType | null
    _min: PlayerRankingMinAggregateOutputType | null
    _max: PlayerRankingMaxAggregateOutputType | null
  }

  type GetPlayerRankingGroupByPayload<T extends PlayerRankingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlayerRankingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlayerRankingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlayerRankingGroupByOutputType[P]>
            : GetScalarType<T[P], PlayerRankingGroupByOutputType[P]>
        }
      >
    >


  export type PlayerRankingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    playerId?: boolean
    source?: boolean
    rankOverall?: boolean
    rankPosition?: boolean
    week?: boolean
    season?: boolean
    fetchedAt?: boolean
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playerRanking"]>

  export type PlayerRankingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    playerId?: boolean
    source?: boolean
    rankOverall?: boolean
    rankPosition?: boolean
    week?: boolean
    season?: boolean
    fetchedAt?: boolean
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playerRanking"]>

  export type PlayerRankingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    playerId?: boolean
    source?: boolean
    rankOverall?: boolean
    rankPosition?: boolean
    week?: boolean
    season?: boolean
    fetchedAt?: boolean
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playerRanking"]>

  export type PlayerRankingSelectScalar = {
    id?: boolean
    playerId?: boolean
    source?: boolean
    rankOverall?: boolean
    rankPosition?: boolean
    week?: boolean
    season?: boolean
    fetchedAt?: boolean
  }

  export type PlayerRankingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "playerId" | "source" | "rankOverall" | "rankPosition" | "week" | "season" | "fetchedAt", ExtArgs["result"]["playerRanking"]>
  export type PlayerRankingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }
  export type PlayerRankingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }
  export type PlayerRankingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }

  export type $PlayerRankingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlayerRanking"
    objects: {
      player: Prisma.$PlayerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      playerId: string
      /**
       * "fantasypros" | "sleeper_trending"
       */
      source: string
      rankOverall: number
      rankPosition: number
      week: number
      season: number
      fetchedAt: Date
    }, ExtArgs["result"]["playerRanking"]>
    composites: {}
  }

  type PlayerRankingGetPayload<S extends boolean | null | undefined | PlayerRankingDefaultArgs> = $Result.GetResult<Prisma.$PlayerRankingPayload, S>

  type PlayerRankingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlayerRankingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlayerRankingCountAggregateInputType | true
    }

  export interface PlayerRankingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlayerRanking'], meta: { name: 'PlayerRanking' } }
    /**
     * Find zero or one PlayerRanking that matches the filter.
     * @param {PlayerRankingFindUniqueArgs} args - Arguments to find a PlayerRanking
     * @example
     * // Get one PlayerRanking
     * const playerRanking = await prisma.playerRanking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerRankingFindUniqueArgs>(args: SelectSubset<T, PlayerRankingFindUniqueArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PlayerRanking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlayerRankingFindUniqueOrThrowArgs} args - Arguments to find a PlayerRanking
     * @example
     * // Get one PlayerRanking
     * const playerRanking = await prisma.playerRanking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerRankingFindUniqueOrThrowArgs>(args: SelectSubset<T, PlayerRankingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlayerRanking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingFindFirstArgs} args - Arguments to find a PlayerRanking
     * @example
     * // Get one PlayerRanking
     * const playerRanking = await prisma.playerRanking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerRankingFindFirstArgs>(args?: SelectSubset<T, PlayerRankingFindFirstArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlayerRanking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingFindFirstOrThrowArgs} args - Arguments to find a PlayerRanking
     * @example
     * // Get one PlayerRanking
     * const playerRanking = await prisma.playerRanking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerRankingFindFirstOrThrowArgs>(args?: SelectSubset<T, PlayerRankingFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PlayerRankings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlayerRankings
     * const playerRankings = await prisma.playerRanking.findMany()
     * 
     * // Get first 10 PlayerRankings
     * const playerRankings = await prisma.playerRanking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const playerRankingWithIdOnly = await prisma.playerRanking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlayerRankingFindManyArgs>(args?: SelectSubset<T, PlayerRankingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PlayerRanking.
     * @param {PlayerRankingCreateArgs} args - Arguments to create a PlayerRanking.
     * @example
     * // Create one PlayerRanking
     * const PlayerRanking = await prisma.playerRanking.create({
     *   data: {
     *     // ... data to create a PlayerRanking
     *   }
     * })
     * 
     */
    create<T extends PlayerRankingCreateArgs>(args: SelectSubset<T, PlayerRankingCreateArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PlayerRankings.
     * @param {PlayerRankingCreateManyArgs} args - Arguments to create many PlayerRankings.
     * @example
     * // Create many PlayerRankings
     * const playerRanking = await prisma.playerRanking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlayerRankingCreateManyArgs>(args?: SelectSubset<T, PlayerRankingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlayerRankings and returns the data saved in the database.
     * @param {PlayerRankingCreateManyAndReturnArgs} args - Arguments to create many PlayerRankings.
     * @example
     * // Create many PlayerRankings
     * const playerRanking = await prisma.playerRanking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlayerRankings and only return the `id`
     * const playerRankingWithIdOnly = await prisma.playerRanking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlayerRankingCreateManyAndReturnArgs>(args?: SelectSubset<T, PlayerRankingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PlayerRanking.
     * @param {PlayerRankingDeleteArgs} args - Arguments to delete one PlayerRanking.
     * @example
     * // Delete one PlayerRanking
     * const PlayerRanking = await prisma.playerRanking.delete({
     *   where: {
     *     // ... filter to delete one PlayerRanking
     *   }
     * })
     * 
     */
    delete<T extends PlayerRankingDeleteArgs>(args: SelectSubset<T, PlayerRankingDeleteArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PlayerRanking.
     * @param {PlayerRankingUpdateArgs} args - Arguments to update one PlayerRanking.
     * @example
     * // Update one PlayerRanking
     * const playerRanking = await prisma.playerRanking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlayerRankingUpdateArgs>(args: SelectSubset<T, PlayerRankingUpdateArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PlayerRankings.
     * @param {PlayerRankingDeleteManyArgs} args - Arguments to filter PlayerRankings to delete.
     * @example
     * // Delete a few PlayerRankings
     * const { count } = await prisma.playerRanking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlayerRankingDeleteManyArgs>(args?: SelectSubset<T, PlayerRankingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlayerRankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlayerRankings
     * const playerRanking = await prisma.playerRanking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlayerRankingUpdateManyArgs>(args: SelectSubset<T, PlayerRankingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlayerRankings and returns the data updated in the database.
     * @param {PlayerRankingUpdateManyAndReturnArgs} args - Arguments to update many PlayerRankings.
     * @example
     * // Update many PlayerRankings
     * const playerRanking = await prisma.playerRanking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PlayerRankings and only return the `id`
     * const playerRankingWithIdOnly = await prisma.playerRanking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PlayerRankingUpdateManyAndReturnArgs>(args: SelectSubset<T, PlayerRankingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PlayerRanking.
     * @param {PlayerRankingUpsertArgs} args - Arguments to update or create a PlayerRanking.
     * @example
     * // Update or create a PlayerRanking
     * const playerRanking = await prisma.playerRanking.upsert({
     *   create: {
     *     // ... data to create a PlayerRanking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlayerRanking we want to update
     *   }
     * })
     */
    upsert<T extends PlayerRankingUpsertArgs>(args: SelectSubset<T, PlayerRankingUpsertArgs<ExtArgs>>): Prisma__PlayerRankingClient<$Result.GetResult<Prisma.$PlayerRankingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PlayerRankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingCountArgs} args - Arguments to filter PlayerRankings to count.
     * @example
     * // Count the number of PlayerRankings
     * const count = await prisma.playerRanking.count({
     *   where: {
     *     // ... the filter for the PlayerRankings we want to count
     *   }
     * })
    **/
    count<T extends PlayerRankingCountArgs>(
      args?: Subset<T, PlayerRankingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlayerRankingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlayerRanking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlayerRankingAggregateArgs>(args: Subset<T, PlayerRankingAggregateArgs>): Prisma.PrismaPromise<GetPlayerRankingAggregateType<T>>

    /**
     * Group by PlayerRanking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerRankingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlayerRankingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlayerRankingGroupByArgs['orderBy'] }
        : { orderBy?: PlayerRankingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlayerRankingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlayerRankingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlayerRanking model
   */
  readonly fields: PlayerRankingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlayerRanking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlayerRankingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    player<T extends PlayerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PlayerDefaultArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlayerRanking model
   */
  interface PlayerRankingFieldRefs {
    readonly id: FieldRef<"PlayerRanking", 'String'>
    readonly playerId: FieldRef<"PlayerRanking", 'String'>
    readonly source: FieldRef<"PlayerRanking", 'String'>
    readonly rankOverall: FieldRef<"PlayerRanking", 'Int'>
    readonly rankPosition: FieldRef<"PlayerRanking", 'Int'>
    readonly week: FieldRef<"PlayerRanking", 'Int'>
    readonly season: FieldRef<"PlayerRanking", 'Int'>
    readonly fetchedAt: FieldRef<"PlayerRanking", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlayerRanking findUnique
   */
  export type PlayerRankingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * Filter, which PlayerRanking to fetch.
     */
    where: PlayerRankingWhereUniqueInput
  }

  /**
   * PlayerRanking findUniqueOrThrow
   */
  export type PlayerRankingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * Filter, which PlayerRanking to fetch.
     */
    where: PlayerRankingWhereUniqueInput
  }

  /**
   * PlayerRanking findFirst
   */
  export type PlayerRankingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * Filter, which PlayerRanking to fetch.
     */
    where?: PlayerRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerRankings to fetch.
     */
    orderBy?: PlayerRankingOrderByWithRelationInput | PlayerRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlayerRankings.
     */
    cursor?: PlayerRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerRankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlayerRankings.
     */
    distinct?: PlayerRankingScalarFieldEnum | PlayerRankingScalarFieldEnum[]
  }

  /**
   * PlayerRanking findFirstOrThrow
   */
  export type PlayerRankingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * Filter, which PlayerRanking to fetch.
     */
    where?: PlayerRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerRankings to fetch.
     */
    orderBy?: PlayerRankingOrderByWithRelationInput | PlayerRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlayerRankings.
     */
    cursor?: PlayerRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerRankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlayerRankings.
     */
    distinct?: PlayerRankingScalarFieldEnum | PlayerRankingScalarFieldEnum[]
  }

  /**
   * PlayerRanking findMany
   */
  export type PlayerRankingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * Filter, which PlayerRankings to fetch.
     */
    where?: PlayerRankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerRankings to fetch.
     */
    orderBy?: PlayerRankingOrderByWithRelationInput | PlayerRankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlayerRankings.
     */
    cursor?: PlayerRankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerRankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerRankings.
     */
    skip?: number
    distinct?: PlayerRankingScalarFieldEnum | PlayerRankingScalarFieldEnum[]
  }

  /**
   * PlayerRanking create
   */
  export type PlayerRankingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * The data needed to create a PlayerRanking.
     */
    data: XOR<PlayerRankingCreateInput, PlayerRankingUncheckedCreateInput>
  }

  /**
   * PlayerRanking createMany
   */
  export type PlayerRankingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlayerRankings.
     */
    data: PlayerRankingCreateManyInput | PlayerRankingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlayerRanking createManyAndReturn
   */
  export type PlayerRankingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * The data used to create many PlayerRankings.
     */
    data: PlayerRankingCreateManyInput | PlayerRankingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlayerRanking update
   */
  export type PlayerRankingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * The data needed to update a PlayerRanking.
     */
    data: XOR<PlayerRankingUpdateInput, PlayerRankingUncheckedUpdateInput>
    /**
     * Choose, which PlayerRanking to update.
     */
    where: PlayerRankingWhereUniqueInput
  }

  /**
   * PlayerRanking updateMany
   */
  export type PlayerRankingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlayerRankings.
     */
    data: XOR<PlayerRankingUpdateManyMutationInput, PlayerRankingUncheckedUpdateManyInput>
    /**
     * Filter which PlayerRankings to update
     */
    where?: PlayerRankingWhereInput
    /**
     * Limit how many PlayerRankings to update.
     */
    limit?: number
  }

  /**
   * PlayerRanking updateManyAndReturn
   */
  export type PlayerRankingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * The data used to update PlayerRankings.
     */
    data: XOR<PlayerRankingUpdateManyMutationInput, PlayerRankingUncheckedUpdateManyInput>
    /**
     * Filter which PlayerRankings to update
     */
    where?: PlayerRankingWhereInput
    /**
     * Limit how many PlayerRankings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlayerRanking upsert
   */
  export type PlayerRankingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * The filter to search for the PlayerRanking to update in case it exists.
     */
    where: PlayerRankingWhereUniqueInput
    /**
     * In case the PlayerRanking found by the `where` argument doesn't exist, create a new PlayerRanking with this data.
     */
    create: XOR<PlayerRankingCreateInput, PlayerRankingUncheckedCreateInput>
    /**
     * In case the PlayerRanking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlayerRankingUpdateInput, PlayerRankingUncheckedUpdateInput>
  }

  /**
   * PlayerRanking delete
   */
  export type PlayerRankingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
    /**
     * Filter which PlayerRanking to delete.
     */
    where: PlayerRankingWhereUniqueInput
  }

  /**
   * PlayerRanking deleteMany
   */
  export type PlayerRankingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlayerRankings to delete
     */
    where?: PlayerRankingWhereInput
    /**
     * Limit how many PlayerRankings to delete.
     */
    limit?: number
  }

  /**
   * PlayerRanking without action
   */
  export type PlayerRankingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerRanking
     */
    select?: PlayerRankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlayerRanking
     */
    omit?: PlayerRankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerRankingInclude<ExtArgs> | null
  }


  /**
   * Model TrendingPlayer
   */

  export type AggregateTrendingPlayer = {
    _count: TrendingPlayerCountAggregateOutputType | null
    _avg: TrendingPlayerAvgAggregateOutputType | null
    _sum: TrendingPlayerSumAggregateOutputType | null
    _min: TrendingPlayerMinAggregateOutputType | null
    _max: TrendingPlayerMaxAggregateOutputType | null
  }

  export type TrendingPlayerAvgAggregateOutputType = {
    count: number | null
    lookbackHours: number | null
  }

  export type TrendingPlayerSumAggregateOutputType = {
    count: number | null
    lookbackHours: number | null
  }

  export type TrendingPlayerMinAggregateOutputType = {
    id: string | null
    playerId: string | null
    type: $Enums.TrendingType | null
    count: number | null
    lookbackHours: number | null
    fetchedAt: Date | null
  }

  export type TrendingPlayerMaxAggregateOutputType = {
    id: string | null
    playerId: string | null
    type: $Enums.TrendingType | null
    count: number | null
    lookbackHours: number | null
    fetchedAt: Date | null
  }

  export type TrendingPlayerCountAggregateOutputType = {
    id: number
    playerId: number
    type: number
    count: number
    lookbackHours: number
    fetchedAt: number
    _all: number
  }


  export type TrendingPlayerAvgAggregateInputType = {
    count?: true
    lookbackHours?: true
  }

  export type TrendingPlayerSumAggregateInputType = {
    count?: true
    lookbackHours?: true
  }

  export type TrendingPlayerMinAggregateInputType = {
    id?: true
    playerId?: true
    type?: true
    count?: true
    lookbackHours?: true
    fetchedAt?: true
  }

  export type TrendingPlayerMaxAggregateInputType = {
    id?: true
    playerId?: true
    type?: true
    count?: true
    lookbackHours?: true
    fetchedAt?: true
  }

  export type TrendingPlayerCountAggregateInputType = {
    id?: true
    playerId?: true
    type?: true
    count?: true
    lookbackHours?: true
    fetchedAt?: true
    _all?: true
  }

  export type TrendingPlayerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrendingPlayer to aggregate.
     */
    where?: TrendingPlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrendingPlayers to fetch.
     */
    orderBy?: TrendingPlayerOrderByWithRelationInput | TrendingPlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrendingPlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrendingPlayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrendingPlayers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrendingPlayers
    **/
    _count?: true | TrendingPlayerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrendingPlayerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrendingPlayerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrendingPlayerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrendingPlayerMaxAggregateInputType
  }

  export type GetTrendingPlayerAggregateType<T extends TrendingPlayerAggregateArgs> = {
        [P in keyof T & keyof AggregateTrendingPlayer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrendingPlayer[P]>
      : GetScalarType<T[P], AggregateTrendingPlayer[P]>
  }




  export type TrendingPlayerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrendingPlayerWhereInput
    orderBy?: TrendingPlayerOrderByWithAggregationInput | TrendingPlayerOrderByWithAggregationInput[]
    by: TrendingPlayerScalarFieldEnum[] | TrendingPlayerScalarFieldEnum
    having?: TrendingPlayerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrendingPlayerCountAggregateInputType | true
    _avg?: TrendingPlayerAvgAggregateInputType
    _sum?: TrendingPlayerSumAggregateInputType
    _min?: TrendingPlayerMinAggregateInputType
    _max?: TrendingPlayerMaxAggregateInputType
  }

  export type TrendingPlayerGroupByOutputType = {
    id: string
    playerId: string
    type: $Enums.TrendingType
    count: number
    lookbackHours: number
    fetchedAt: Date
    _count: TrendingPlayerCountAggregateOutputType | null
    _avg: TrendingPlayerAvgAggregateOutputType | null
    _sum: TrendingPlayerSumAggregateOutputType | null
    _min: TrendingPlayerMinAggregateOutputType | null
    _max: TrendingPlayerMaxAggregateOutputType | null
  }

  type GetTrendingPlayerGroupByPayload<T extends TrendingPlayerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrendingPlayerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrendingPlayerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrendingPlayerGroupByOutputType[P]>
            : GetScalarType<T[P], TrendingPlayerGroupByOutputType[P]>
        }
      >
    >


  export type TrendingPlayerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    playerId?: boolean
    type?: boolean
    count?: boolean
    lookbackHours?: boolean
    fetchedAt?: boolean
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trendingPlayer"]>

  export type TrendingPlayerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    playerId?: boolean
    type?: boolean
    count?: boolean
    lookbackHours?: boolean
    fetchedAt?: boolean
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trendingPlayer"]>

  export type TrendingPlayerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    playerId?: boolean
    type?: boolean
    count?: boolean
    lookbackHours?: boolean
    fetchedAt?: boolean
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trendingPlayer"]>

  export type TrendingPlayerSelectScalar = {
    id?: boolean
    playerId?: boolean
    type?: boolean
    count?: boolean
    lookbackHours?: boolean
    fetchedAt?: boolean
  }

  export type TrendingPlayerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "playerId" | "type" | "count" | "lookbackHours" | "fetchedAt", ExtArgs["result"]["trendingPlayer"]>
  export type TrendingPlayerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }
  export type TrendingPlayerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }
  export type TrendingPlayerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    player?: boolean | PlayerDefaultArgs<ExtArgs>
  }

  export type $TrendingPlayerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrendingPlayer"
    objects: {
      player: Prisma.$PlayerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      playerId: string
      type: $Enums.TrendingType
      count: number
      lookbackHours: number
      fetchedAt: Date
    }, ExtArgs["result"]["trendingPlayer"]>
    composites: {}
  }

  type TrendingPlayerGetPayload<S extends boolean | null | undefined | TrendingPlayerDefaultArgs> = $Result.GetResult<Prisma.$TrendingPlayerPayload, S>

  type TrendingPlayerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TrendingPlayerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TrendingPlayerCountAggregateInputType | true
    }

  export interface TrendingPlayerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrendingPlayer'], meta: { name: 'TrendingPlayer' } }
    /**
     * Find zero or one TrendingPlayer that matches the filter.
     * @param {TrendingPlayerFindUniqueArgs} args - Arguments to find a TrendingPlayer
     * @example
     * // Get one TrendingPlayer
     * const trendingPlayer = await prisma.trendingPlayer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrendingPlayerFindUniqueArgs>(args: SelectSubset<T, TrendingPlayerFindUniqueArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TrendingPlayer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TrendingPlayerFindUniqueOrThrowArgs} args - Arguments to find a TrendingPlayer
     * @example
     * // Get one TrendingPlayer
     * const trendingPlayer = await prisma.trendingPlayer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrendingPlayerFindUniqueOrThrowArgs>(args: SelectSubset<T, TrendingPlayerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrendingPlayer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerFindFirstArgs} args - Arguments to find a TrendingPlayer
     * @example
     * // Get one TrendingPlayer
     * const trendingPlayer = await prisma.trendingPlayer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrendingPlayerFindFirstArgs>(args?: SelectSubset<T, TrendingPlayerFindFirstArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TrendingPlayer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerFindFirstOrThrowArgs} args - Arguments to find a TrendingPlayer
     * @example
     * // Get one TrendingPlayer
     * const trendingPlayer = await prisma.trendingPlayer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrendingPlayerFindFirstOrThrowArgs>(args?: SelectSubset<T, TrendingPlayerFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TrendingPlayers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrendingPlayers
     * const trendingPlayers = await prisma.trendingPlayer.findMany()
     * 
     * // Get first 10 TrendingPlayers
     * const trendingPlayers = await prisma.trendingPlayer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trendingPlayerWithIdOnly = await prisma.trendingPlayer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrendingPlayerFindManyArgs>(args?: SelectSubset<T, TrendingPlayerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TrendingPlayer.
     * @param {TrendingPlayerCreateArgs} args - Arguments to create a TrendingPlayer.
     * @example
     * // Create one TrendingPlayer
     * const TrendingPlayer = await prisma.trendingPlayer.create({
     *   data: {
     *     // ... data to create a TrendingPlayer
     *   }
     * })
     * 
     */
    create<T extends TrendingPlayerCreateArgs>(args: SelectSubset<T, TrendingPlayerCreateArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TrendingPlayers.
     * @param {TrendingPlayerCreateManyArgs} args - Arguments to create many TrendingPlayers.
     * @example
     * // Create many TrendingPlayers
     * const trendingPlayer = await prisma.trendingPlayer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrendingPlayerCreateManyArgs>(args?: SelectSubset<T, TrendingPlayerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrendingPlayers and returns the data saved in the database.
     * @param {TrendingPlayerCreateManyAndReturnArgs} args - Arguments to create many TrendingPlayers.
     * @example
     * // Create many TrendingPlayers
     * const trendingPlayer = await prisma.trendingPlayer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrendingPlayers and only return the `id`
     * const trendingPlayerWithIdOnly = await prisma.trendingPlayer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrendingPlayerCreateManyAndReturnArgs>(args?: SelectSubset<T, TrendingPlayerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TrendingPlayer.
     * @param {TrendingPlayerDeleteArgs} args - Arguments to delete one TrendingPlayer.
     * @example
     * // Delete one TrendingPlayer
     * const TrendingPlayer = await prisma.trendingPlayer.delete({
     *   where: {
     *     // ... filter to delete one TrendingPlayer
     *   }
     * })
     * 
     */
    delete<T extends TrendingPlayerDeleteArgs>(args: SelectSubset<T, TrendingPlayerDeleteArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TrendingPlayer.
     * @param {TrendingPlayerUpdateArgs} args - Arguments to update one TrendingPlayer.
     * @example
     * // Update one TrendingPlayer
     * const trendingPlayer = await prisma.trendingPlayer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrendingPlayerUpdateArgs>(args: SelectSubset<T, TrendingPlayerUpdateArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TrendingPlayers.
     * @param {TrendingPlayerDeleteManyArgs} args - Arguments to filter TrendingPlayers to delete.
     * @example
     * // Delete a few TrendingPlayers
     * const { count } = await prisma.trendingPlayer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrendingPlayerDeleteManyArgs>(args?: SelectSubset<T, TrendingPlayerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrendingPlayers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrendingPlayers
     * const trendingPlayer = await prisma.trendingPlayer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrendingPlayerUpdateManyArgs>(args: SelectSubset<T, TrendingPlayerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrendingPlayers and returns the data updated in the database.
     * @param {TrendingPlayerUpdateManyAndReturnArgs} args - Arguments to update many TrendingPlayers.
     * @example
     * // Update many TrendingPlayers
     * const trendingPlayer = await prisma.trendingPlayer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TrendingPlayers and only return the `id`
     * const trendingPlayerWithIdOnly = await prisma.trendingPlayer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TrendingPlayerUpdateManyAndReturnArgs>(args: SelectSubset<T, TrendingPlayerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TrendingPlayer.
     * @param {TrendingPlayerUpsertArgs} args - Arguments to update or create a TrendingPlayer.
     * @example
     * // Update or create a TrendingPlayer
     * const trendingPlayer = await prisma.trendingPlayer.upsert({
     *   create: {
     *     // ... data to create a TrendingPlayer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrendingPlayer we want to update
     *   }
     * })
     */
    upsert<T extends TrendingPlayerUpsertArgs>(args: SelectSubset<T, TrendingPlayerUpsertArgs<ExtArgs>>): Prisma__TrendingPlayerClient<$Result.GetResult<Prisma.$TrendingPlayerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TrendingPlayers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerCountArgs} args - Arguments to filter TrendingPlayers to count.
     * @example
     * // Count the number of TrendingPlayers
     * const count = await prisma.trendingPlayer.count({
     *   where: {
     *     // ... the filter for the TrendingPlayers we want to count
     *   }
     * })
    **/
    count<T extends TrendingPlayerCountArgs>(
      args?: Subset<T, TrendingPlayerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrendingPlayerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrendingPlayer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrendingPlayerAggregateArgs>(args: Subset<T, TrendingPlayerAggregateArgs>): Prisma.PrismaPromise<GetTrendingPlayerAggregateType<T>>

    /**
     * Group by TrendingPlayer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrendingPlayerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrendingPlayerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrendingPlayerGroupByArgs['orderBy'] }
        : { orderBy?: TrendingPlayerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrendingPlayerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrendingPlayerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrendingPlayer model
   */
  readonly fields: TrendingPlayerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrendingPlayer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrendingPlayerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    player<T extends PlayerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PlayerDefaultArgs<ExtArgs>>): Prisma__PlayerClient<$Result.GetResult<Prisma.$PlayerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TrendingPlayer model
   */
  interface TrendingPlayerFieldRefs {
    readonly id: FieldRef<"TrendingPlayer", 'String'>
    readonly playerId: FieldRef<"TrendingPlayer", 'String'>
    readonly type: FieldRef<"TrendingPlayer", 'TrendingType'>
    readonly count: FieldRef<"TrendingPlayer", 'Int'>
    readonly lookbackHours: FieldRef<"TrendingPlayer", 'Int'>
    readonly fetchedAt: FieldRef<"TrendingPlayer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TrendingPlayer findUnique
   */
  export type TrendingPlayerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * Filter, which TrendingPlayer to fetch.
     */
    where: TrendingPlayerWhereUniqueInput
  }

  /**
   * TrendingPlayer findUniqueOrThrow
   */
  export type TrendingPlayerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * Filter, which TrendingPlayer to fetch.
     */
    where: TrendingPlayerWhereUniqueInput
  }

  /**
   * TrendingPlayer findFirst
   */
  export type TrendingPlayerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * Filter, which TrendingPlayer to fetch.
     */
    where?: TrendingPlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrendingPlayers to fetch.
     */
    orderBy?: TrendingPlayerOrderByWithRelationInput | TrendingPlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrendingPlayers.
     */
    cursor?: TrendingPlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrendingPlayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrendingPlayers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrendingPlayers.
     */
    distinct?: TrendingPlayerScalarFieldEnum | TrendingPlayerScalarFieldEnum[]
  }

  /**
   * TrendingPlayer findFirstOrThrow
   */
  export type TrendingPlayerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * Filter, which TrendingPlayer to fetch.
     */
    where?: TrendingPlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrendingPlayers to fetch.
     */
    orderBy?: TrendingPlayerOrderByWithRelationInput | TrendingPlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrendingPlayers.
     */
    cursor?: TrendingPlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrendingPlayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrendingPlayers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrendingPlayers.
     */
    distinct?: TrendingPlayerScalarFieldEnum | TrendingPlayerScalarFieldEnum[]
  }

  /**
   * TrendingPlayer findMany
   */
  export type TrendingPlayerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * Filter, which TrendingPlayers to fetch.
     */
    where?: TrendingPlayerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrendingPlayers to fetch.
     */
    orderBy?: TrendingPlayerOrderByWithRelationInput | TrendingPlayerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrendingPlayers.
     */
    cursor?: TrendingPlayerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrendingPlayers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrendingPlayers.
     */
    skip?: number
    distinct?: TrendingPlayerScalarFieldEnum | TrendingPlayerScalarFieldEnum[]
  }

  /**
   * TrendingPlayer create
   */
  export type TrendingPlayerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * The data needed to create a TrendingPlayer.
     */
    data: XOR<TrendingPlayerCreateInput, TrendingPlayerUncheckedCreateInput>
  }

  /**
   * TrendingPlayer createMany
   */
  export type TrendingPlayerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrendingPlayers.
     */
    data: TrendingPlayerCreateManyInput | TrendingPlayerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TrendingPlayer createManyAndReturn
   */
  export type TrendingPlayerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * The data used to create many TrendingPlayers.
     */
    data: TrendingPlayerCreateManyInput | TrendingPlayerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrendingPlayer update
   */
  export type TrendingPlayerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * The data needed to update a TrendingPlayer.
     */
    data: XOR<TrendingPlayerUpdateInput, TrendingPlayerUncheckedUpdateInput>
    /**
     * Choose, which TrendingPlayer to update.
     */
    where: TrendingPlayerWhereUniqueInput
  }

  /**
   * TrendingPlayer updateMany
   */
  export type TrendingPlayerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrendingPlayers.
     */
    data: XOR<TrendingPlayerUpdateManyMutationInput, TrendingPlayerUncheckedUpdateManyInput>
    /**
     * Filter which TrendingPlayers to update
     */
    where?: TrendingPlayerWhereInput
    /**
     * Limit how many TrendingPlayers to update.
     */
    limit?: number
  }

  /**
   * TrendingPlayer updateManyAndReturn
   */
  export type TrendingPlayerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * The data used to update TrendingPlayers.
     */
    data: XOR<TrendingPlayerUpdateManyMutationInput, TrendingPlayerUncheckedUpdateManyInput>
    /**
     * Filter which TrendingPlayers to update
     */
    where?: TrendingPlayerWhereInput
    /**
     * Limit how many TrendingPlayers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TrendingPlayer upsert
   */
  export type TrendingPlayerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * The filter to search for the TrendingPlayer to update in case it exists.
     */
    where: TrendingPlayerWhereUniqueInput
    /**
     * In case the TrendingPlayer found by the `where` argument doesn't exist, create a new TrendingPlayer with this data.
     */
    create: XOR<TrendingPlayerCreateInput, TrendingPlayerUncheckedCreateInput>
    /**
     * In case the TrendingPlayer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrendingPlayerUpdateInput, TrendingPlayerUncheckedUpdateInput>
  }

  /**
   * TrendingPlayer delete
   */
  export type TrendingPlayerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
    /**
     * Filter which TrendingPlayer to delete.
     */
    where: TrendingPlayerWhereUniqueInput
  }

  /**
   * TrendingPlayer deleteMany
   */
  export type TrendingPlayerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrendingPlayers to delete
     */
    where?: TrendingPlayerWhereInput
    /**
     * Limit how many TrendingPlayers to delete.
     */
    limit?: number
  }

  /**
   * TrendingPlayer without action
   */
  export type TrendingPlayerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrendingPlayer
     */
    select?: TrendingPlayerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TrendingPlayer
     */
    omit?: TrendingPlayerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrendingPlayerInclude<ExtArgs> | null
  }


  /**
   * Model ContentItem
   */

  export type AggregateContentItem = {
    _count: ContentItemCountAggregateOutputType | null
    _avg: ContentItemAvgAggregateOutputType | null
    _sum: ContentItemSumAggregateOutputType | null
    _min: ContentItemMinAggregateOutputType | null
    _max: ContentItemMaxAggregateOutputType | null
  }

  export type ContentItemAvgAggregateOutputType = {
    importanceScore: number | null
    noveltyScore: number | null
  }

  export type ContentItemSumAggregateOutputType = {
    importanceScore: number | null
    noveltyScore: number | null
  }

  export type ContentItemMinAggregateOutputType = {
    id: string | null
    sourceType: string | null
    sourceUrl: string | null
    title: string | null
    publishedAt: Date | null
    authorName: string | null
    rawContent: string | null
    importanceScore: number | null
    noveltyScore: number | null
    fetchedAt: Date | null
    sourceId: string | null
  }

  export type ContentItemMaxAggregateOutputType = {
    id: string | null
    sourceType: string | null
    sourceUrl: string | null
    title: string | null
    publishedAt: Date | null
    authorName: string | null
    rawContent: string | null
    importanceScore: number | null
    noveltyScore: number | null
    fetchedAt: Date | null
    sourceId: string | null
  }

  export type ContentItemCountAggregateOutputType = {
    id: number
    sourceType: number
    sourceUrl: number
    title: number
    publishedAt: number
    authorName: number
    rawContent: number
    extractedFacts: number
    playerIds: number
    teamSlugs: number
    topics: number
    importanceScore: number
    noveltyScore: number
    fetchedAt: number
    sourceId: number
    _all: number
  }


  export type ContentItemAvgAggregateInputType = {
    importanceScore?: true
    noveltyScore?: true
  }

  export type ContentItemSumAggregateInputType = {
    importanceScore?: true
    noveltyScore?: true
  }

  export type ContentItemMinAggregateInputType = {
    id?: true
    sourceType?: true
    sourceUrl?: true
    title?: true
    publishedAt?: true
    authorName?: true
    rawContent?: true
    importanceScore?: true
    noveltyScore?: true
    fetchedAt?: true
    sourceId?: true
  }

  export type ContentItemMaxAggregateInputType = {
    id?: true
    sourceType?: true
    sourceUrl?: true
    title?: true
    publishedAt?: true
    authorName?: true
    rawContent?: true
    importanceScore?: true
    noveltyScore?: true
    fetchedAt?: true
    sourceId?: true
  }

  export type ContentItemCountAggregateInputType = {
    id?: true
    sourceType?: true
    sourceUrl?: true
    title?: true
    publishedAt?: true
    authorName?: true
    rawContent?: true
    extractedFacts?: true
    playerIds?: true
    teamSlugs?: true
    topics?: true
    importanceScore?: true
    noveltyScore?: true
    fetchedAt?: true
    sourceId?: true
    _all?: true
  }

  export type ContentItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContentItem to aggregate.
     */
    where?: ContentItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentItems to fetch.
     */
    orderBy?: ContentItemOrderByWithRelationInput | ContentItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContentItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContentItems
    **/
    _count?: true | ContentItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ContentItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ContentItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContentItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContentItemMaxAggregateInputType
  }

  export type GetContentItemAggregateType<T extends ContentItemAggregateArgs> = {
        [P in keyof T & keyof AggregateContentItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContentItem[P]>
      : GetScalarType<T[P], AggregateContentItem[P]>
  }




  export type ContentItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContentItemWhereInput
    orderBy?: ContentItemOrderByWithAggregationInput | ContentItemOrderByWithAggregationInput[]
    by: ContentItemScalarFieldEnum[] | ContentItemScalarFieldEnum
    having?: ContentItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContentItemCountAggregateInputType | true
    _avg?: ContentItemAvgAggregateInputType
    _sum?: ContentItemSumAggregateInputType
    _min?: ContentItemMinAggregateInputType
    _max?: ContentItemMaxAggregateInputType
  }

  export type ContentItemGroupByOutputType = {
    id: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt: Date | null
    authorName: string | null
    rawContent: string
    extractedFacts: JsonValue
    playerIds: string[]
    teamSlugs: string[]
    topics: string[]
    importanceScore: number | null
    noveltyScore: number | null
    fetchedAt: Date
    sourceId: string | null
    _count: ContentItemCountAggregateOutputType | null
    _avg: ContentItemAvgAggregateOutputType | null
    _sum: ContentItemSumAggregateOutputType | null
    _min: ContentItemMinAggregateOutputType | null
    _max: ContentItemMaxAggregateOutputType | null
  }

  type GetContentItemGroupByPayload<T extends ContentItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContentItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContentItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContentItemGroupByOutputType[P]>
            : GetScalarType<T[P], ContentItemGroupByOutputType[P]>
        }
      >
    >


  export type ContentItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sourceType?: boolean
    sourceUrl?: boolean
    title?: boolean
    publishedAt?: boolean
    authorName?: boolean
    rawContent?: boolean
    extractedFacts?: boolean
    playerIds?: boolean
    teamSlugs?: boolean
    topics?: boolean
    importanceScore?: boolean
    noveltyScore?: boolean
    fetchedAt?: boolean
    sourceId?: boolean
    source?: boolean | ContentItem$sourceArgs<ExtArgs>
  }, ExtArgs["result"]["contentItem"]>

  export type ContentItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sourceType?: boolean
    sourceUrl?: boolean
    title?: boolean
    publishedAt?: boolean
    authorName?: boolean
    rawContent?: boolean
    extractedFacts?: boolean
    playerIds?: boolean
    teamSlugs?: boolean
    topics?: boolean
    importanceScore?: boolean
    noveltyScore?: boolean
    fetchedAt?: boolean
    sourceId?: boolean
    source?: boolean | ContentItem$sourceArgs<ExtArgs>
  }, ExtArgs["result"]["contentItem"]>

  export type ContentItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sourceType?: boolean
    sourceUrl?: boolean
    title?: boolean
    publishedAt?: boolean
    authorName?: boolean
    rawContent?: boolean
    extractedFacts?: boolean
    playerIds?: boolean
    teamSlugs?: boolean
    topics?: boolean
    importanceScore?: boolean
    noveltyScore?: boolean
    fetchedAt?: boolean
    sourceId?: boolean
    source?: boolean | ContentItem$sourceArgs<ExtArgs>
  }, ExtArgs["result"]["contentItem"]>

  export type ContentItemSelectScalar = {
    id?: boolean
    sourceType?: boolean
    sourceUrl?: boolean
    title?: boolean
    publishedAt?: boolean
    authorName?: boolean
    rawContent?: boolean
    extractedFacts?: boolean
    playerIds?: boolean
    teamSlugs?: boolean
    topics?: boolean
    importanceScore?: boolean
    noveltyScore?: boolean
    fetchedAt?: boolean
    sourceId?: boolean
  }

  export type ContentItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sourceType" | "sourceUrl" | "title" | "publishedAt" | "authorName" | "rawContent" | "extractedFacts" | "playerIds" | "teamSlugs" | "topics" | "importanceScore" | "noveltyScore" | "fetchedAt" | "sourceId", ExtArgs["result"]["contentItem"]>
  export type ContentItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    source?: boolean | ContentItem$sourceArgs<ExtArgs>
  }
  export type ContentItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    source?: boolean | ContentItem$sourceArgs<ExtArgs>
  }
  export type ContentItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    source?: boolean | ContentItem$sourceArgs<ExtArgs>
  }

  export type $ContentItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContentItem"
    objects: {
      source: Prisma.$ContentSourcePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      /**
       * "article" | "youtube" | "podcast" | "tweet"
       */
      sourceType: string
      sourceUrl: string
      title: string
      publishedAt: Date | null
      authorName: string | null
      /**
       * Full raw content text — preserved for reprocessing
       */
      rawContent: string
      /**
       * Structured extraction: players mentioned, sentiment, event type, etc.
       * See docs/DATA.md for format.
       */
      extractedFacts: Prisma.JsonValue
      /**
       * Sleeper player IDs mentioned in this content
       */
      playerIds: string[]
      /**
       * NFL team abbreviations mentioned
       */
      teamSlugs: string[]
      /**
       * Content topics e.g. ["injury", "usage_spike", "depth_chart_change"]
       */
      topics: string[]
      importanceScore: number | null
      noveltyScore: number | null
      fetchedAt: Date
      sourceId: string | null
    }, ExtArgs["result"]["contentItem"]>
    composites: {}
  }

  type ContentItemGetPayload<S extends boolean | null | undefined | ContentItemDefaultArgs> = $Result.GetResult<Prisma.$ContentItemPayload, S>

  type ContentItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContentItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContentItemCountAggregateInputType | true
    }

  export interface ContentItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContentItem'], meta: { name: 'ContentItem' } }
    /**
     * Find zero or one ContentItem that matches the filter.
     * @param {ContentItemFindUniqueArgs} args - Arguments to find a ContentItem
     * @example
     * // Get one ContentItem
     * const contentItem = await prisma.contentItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContentItemFindUniqueArgs>(args: SelectSubset<T, ContentItemFindUniqueArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ContentItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContentItemFindUniqueOrThrowArgs} args - Arguments to find a ContentItem
     * @example
     * // Get one ContentItem
     * const contentItem = await prisma.contentItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContentItemFindUniqueOrThrowArgs>(args: SelectSubset<T, ContentItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContentItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemFindFirstArgs} args - Arguments to find a ContentItem
     * @example
     * // Get one ContentItem
     * const contentItem = await prisma.contentItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContentItemFindFirstArgs>(args?: SelectSubset<T, ContentItemFindFirstArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContentItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemFindFirstOrThrowArgs} args - Arguments to find a ContentItem
     * @example
     * // Get one ContentItem
     * const contentItem = await prisma.contentItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContentItemFindFirstOrThrowArgs>(args?: SelectSubset<T, ContentItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ContentItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContentItems
     * const contentItems = await prisma.contentItem.findMany()
     * 
     * // Get first 10 ContentItems
     * const contentItems = await prisma.contentItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contentItemWithIdOnly = await prisma.contentItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContentItemFindManyArgs>(args?: SelectSubset<T, ContentItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ContentItem.
     * @param {ContentItemCreateArgs} args - Arguments to create a ContentItem.
     * @example
     * // Create one ContentItem
     * const ContentItem = await prisma.contentItem.create({
     *   data: {
     *     // ... data to create a ContentItem
     *   }
     * })
     * 
     */
    create<T extends ContentItemCreateArgs>(args: SelectSubset<T, ContentItemCreateArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ContentItems.
     * @param {ContentItemCreateManyArgs} args - Arguments to create many ContentItems.
     * @example
     * // Create many ContentItems
     * const contentItem = await prisma.contentItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContentItemCreateManyArgs>(args?: SelectSubset<T, ContentItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ContentItems and returns the data saved in the database.
     * @param {ContentItemCreateManyAndReturnArgs} args - Arguments to create many ContentItems.
     * @example
     * // Create many ContentItems
     * const contentItem = await prisma.contentItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ContentItems and only return the `id`
     * const contentItemWithIdOnly = await prisma.contentItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContentItemCreateManyAndReturnArgs>(args?: SelectSubset<T, ContentItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ContentItem.
     * @param {ContentItemDeleteArgs} args - Arguments to delete one ContentItem.
     * @example
     * // Delete one ContentItem
     * const ContentItem = await prisma.contentItem.delete({
     *   where: {
     *     // ... filter to delete one ContentItem
     *   }
     * })
     * 
     */
    delete<T extends ContentItemDeleteArgs>(args: SelectSubset<T, ContentItemDeleteArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ContentItem.
     * @param {ContentItemUpdateArgs} args - Arguments to update one ContentItem.
     * @example
     * // Update one ContentItem
     * const contentItem = await prisma.contentItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContentItemUpdateArgs>(args: SelectSubset<T, ContentItemUpdateArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ContentItems.
     * @param {ContentItemDeleteManyArgs} args - Arguments to filter ContentItems to delete.
     * @example
     * // Delete a few ContentItems
     * const { count } = await prisma.contentItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContentItemDeleteManyArgs>(args?: SelectSubset<T, ContentItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContentItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContentItems
     * const contentItem = await prisma.contentItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContentItemUpdateManyArgs>(args: SelectSubset<T, ContentItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContentItems and returns the data updated in the database.
     * @param {ContentItemUpdateManyAndReturnArgs} args - Arguments to update many ContentItems.
     * @example
     * // Update many ContentItems
     * const contentItem = await prisma.contentItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ContentItems and only return the `id`
     * const contentItemWithIdOnly = await prisma.contentItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ContentItemUpdateManyAndReturnArgs>(args: SelectSubset<T, ContentItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ContentItem.
     * @param {ContentItemUpsertArgs} args - Arguments to update or create a ContentItem.
     * @example
     * // Update or create a ContentItem
     * const contentItem = await prisma.contentItem.upsert({
     *   create: {
     *     // ... data to create a ContentItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContentItem we want to update
     *   }
     * })
     */
    upsert<T extends ContentItemUpsertArgs>(args: SelectSubset<T, ContentItemUpsertArgs<ExtArgs>>): Prisma__ContentItemClient<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ContentItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemCountArgs} args - Arguments to filter ContentItems to count.
     * @example
     * // Count the number of ContentItems
     * const count = await prisma.contentItem.count({
     *   where: {
     *     // ... the filter for the ContentItems we want to count
     *   }
     * })
    **/
    count<T extends ContentItemCountArgs>(
      args?: Subset<T, ContentItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContentItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContentItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContentItemAggregateArgs>(args: Subset<T, ContentItemAggregateArgs>): Prisma.PrismaPromise<GetContentItemAggregateType<T>>

    /**
     * Group by ContentItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContentItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContentItemGroupByArgs['orderBy'] }
        : { orderBy?: ContentItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContentItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContentItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContentItem model
   */
  readonly fields: ContentItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContentItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContentItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    source<T extends ContentItem$sourceArgs<ExtArgs> = {}>(args?: Subset<T, ContentItem$sourceArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ContentItem model
   */
  interface ContentItemFieldRefs {
    readonly id: FieldRef<"ContentItem", 'String'>
    readonly sourceType: FieldRef<"ContentItem", 'String'>
    readonly sourceUrl: FieldRef<"ContentItem", 'String'>
    readonly title: FieldRef<"ContentItem", 'String'>
    readonly publishedAt: FieldRef<"ContentItem", 'DateTime'>
    readonly authorName: FieldRef<"ContentItem", 'String'>
    readonly rawContent: FieldRef<"ContentItem", 'String'>
    readonly extractedFacts: FieldRef<"ContentItem", 'Json'>
    readonly playerIds: FieldRef<"ContentItem", 'String[]'>
    readonly teamSlugs: FieldRef<"ContentItem", 'String[]'>
    readonly topics: FieldRef<"ContentItem", 'String[]'>
    readonly importanceScore: FieldRef<"ContentItem", 'Float'>
    readonly noveltyScore: FieldRef<"ContentItem", 'Float'>
    readonly fetchedAt: FieldRef<"ContentItem", 'DateTime'>
    readonly sourceId: FieldRef<"ContentItem", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ContentItem findUnique
   */
  export type ContentItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * Filter, which ContentItem to fetch.
     */
    where: ContentItemWhereUniqueInput
  }

  /**
   * ContentItem findUniqueOrThrow
   */
  export type ContentItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * Filter, which ContentItem to fetch.
     */
    where: ContentItemWhereUniqueInput
  }

  /**
   * ContentItem findFirst
   */
  export type ContentItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * Filter, which ContentItem to fetch.
     */
    where?: ContentItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentItems to fetch.
     */
    orderBy?: ContentItemOrderByWithRelationInput | ContentItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContentItems.
     */
    cursor?: ContentItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContentItems.
     */
    distinct?: ContentItemScalarFieldEnum | ContentItemScalarFieldEnum[]
  }

  /**
   * ContentItem findFirstOrThrow
   */
  export type ContentItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * Filter, which ContentItem to fetch.
     */
    where?: ContentItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentItems to fetch.
     */
    orderBy?: ContentItemOrderByWithRelationInput | ContentItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContentItems.
     */
    cursor?: ContentItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContentItems.
     */
    distinct?: ContentItemScalarFieldEnum | ContentItemScalarFieldEnum[]
  }

  /**
   * ContentItem findMany
   */
  export type ContentItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * Filter, which ContentItems to fetch.
     */
    where?: ContentItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentItems to fetch.
     */
    orderBy?: ContentItemOrderByWithRelationInput | ContentItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContentItems.
     */
    cursor?: ContentItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentItems.
     */
    skip?: number
    distinct?: ContentItemScalarFieldEnum | ContentItemScalarFieldEnum[]
  }

  /**
   * ContentItem create
   */
  export type ContentItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * The data needed to create a ContentItem.
     */
    data: XOR<ContentItemCreateInput, ContentItemUncheckedCreateInput>
  }

  /**
   * ContentItem createMany
   */
  export type ContentItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContentItems.
     */
    data: ContentItemCreateManyInput | ContentItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContentItem createManyAndReturn
   */
  export type ContentItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * The data used to create many ContentItems.
     */
    data: ContentItemCreateManyInput | ContentItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ContentItem update
   */
  export type ContentItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * The data needed to update a ContentItem.
     */
    data: XOR<ContentItemUpdateInput, ContentItemUncheckedUpdateInput>
    /**
     * Choose, which ContentItem to update.
     */
    where: ContentItemWhereUniqueInput
  }

  /**
   * ContentItem updateMany
   */
  export type ContentItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContentItems.
     */
    data: XOR<ContentItemUpdateManyMutationInput, ContentItemUncheckedUpdateManyInput>
    /**
     * Filter which ContentItems to update
     */
    where?: ContentItemWhereInput
    /**
     * Limit how many ContentItems to update.
     */
    limit?: number
  }

  /**
   * ContentItem updateManyAndReturn
   */
  export type ContentItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * The data used to update ContentItems.
     */
    data: XOR<ContentItemUpdateManyMutationInput, ContentItemUncheckedUpdateManyInput>
    /**
     * Filter which ContentItems to update
     */
    where?: ContentItemWhereInput
    /**
     * Limit how many ContentItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ContentItem upsert
   */
  export type ContentItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * The filter to search for the ContentItem to update in case it exists.
     */
    where: ContentItemWhereUniqueInput
    /**
     * In case the ContentItem found by the `where` argument doesn't exist, create a new ContentItem with this data.
     */
    create: XOR<ContentItemCreateInput, ContentItemUncheckedCreateInput>
    /**
     * In case the ContentItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContentItemUpdateInput, ContentItemUncheckedUpdateInput>
  }

  /**
   * ContentItem delete
   */
  export type ContentItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    /**
     * Filter which ContentItem to delete.
     */
    where: ContentItemWhereUniqueInput
  }

  /**
   * ContentItem deleteMany
   */
  export type ContentItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContentItems to delete
     */
    where?: ContentItemWhereInput
    /**
     * Limit how many ContentItems to delete.
     */
    limit?: number
  }

  /**
   * ContentItem.source
   */
  export type ContentItem$sourceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    where?: ContentSourceWhereInput
  }

  /**
   * ContentItem without action
   */
  export type ContentItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
  }


  /**
   * Model ContentSource
   */

  export type AggregateContentSource = {
    _count: ContentSourceCountAggregateOutputType | null
    _avg: ContentSourceAvgAggregateOutputType | null
    _sum: ContentSourceSumAggregateOutputType | null
    _min: ContentSourceMinAggregateOutputType | null
    _max: ContentSourceMaxAggregateOutputType | null
  }

  export type ContentSourceAvgAggregateOutputType = {
    refreshIntervalMins: number | null
  }

  export type ContentSourceSumAggregateOutputType = {
    refreshIntervalMins: number | null
  }

  export type ContentSourceMinAggregateOutputType = {
    id: string | null
    name: string | null
    type: string | null
    url: string | null
    refreshIntervalMins: number | null
    lastFetchedAt: Date | null
    isActive: boolean | null
  }

  export type ContentSourceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    type: string | null
    url: string | null
    refreshIntervalMins: number | null
    lastFetchedAt: Date | null
    isActive: boolean | null
  }

  export type ContentSourceCountAggregateOutputType = {
    id: number
    name: number
    type: number
    url: number
    refreshIntervalMins: number
    lastFetchedAt: number
    isActive: number
    _all: number
  }


  export type ContentSourceAvgAggregateInputType = {
    refreshIntervalMins?: true
  }

  export type ContentSourceSumAggregateInputType = {
    refreshIntervalMins?: true
  }

  export type ContentSourceMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    url?: true
    refreshIntervalMins?: true
    lastFetchedAt?: true
    isActive?: true
  }

  export type ContentSourceMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    url?: true
    refreshIntervalMins?: true
    lastFetchedAt?: true
    isActive?: true
  }

  export type ContentSourceCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    url?: true
    refreshIntervalMins?: true
    lastFetchedAt?: true
    isActive?: true
    _all?: true
  }

  export type ContentSourceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContentSource to aggregate.
     */
    where?: ContentSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentSources to fetch.
     */
    orderBy?: ContentSourceOrderByWithRelationInput | ContentSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContentSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentSources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContentSources
    **/
    _count?: true | ContentSourceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ContentSourceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ContentSourceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContentSourceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContentSourceMaxAggregateInputType
  }

  export type GetContentSourceAggregateType<T extends ContentSourceAggregateArgs> = {
        [P in keyof T & keyof AggregateContentSource]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContentSource[P]>
      : GetScalarType<T[P], AggregateContentSource[P]>
  }




  export type ContentSourceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContentSourceWhereInput
    orderBy?: ContentSourceOrderByWithAggregationInput | ContentSourceOrderByWithAggregationInput[]
    by: ContentSourceScalarFieldEnum[] | ContentSourceScalarFieldEnum
    having?: ContentSourceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContentSourceCountAggregateInputType | true
    _avg?: ContentSourceAvgAggregateInputType
    _sum?: ContentSourceSumAggregateInputType
    _min?: ContentSourceMinAggregateInputType
    _max?: ContentSourceMaxAggregateInputType
  }

  export type ContentSourceGroupByOutputType = {
    id: string
    name: string
    type: string
    url: string
    refreshIntervalMins: number
    lastFetchedAt: Date | null
    isActive: boolean
    _count: ContentSourceCountAggregateOutputType | null
    _avg: ContentSourceAvgAggregateOutputType | null
    _sum: ContentSourceSumAggregateOutputType | null
    _min: ContentSourceMinAggregateOutputType | null
    _max: ContentSourceMaxAggregateOutputType | null
  }

  type GetContentSourceGroupByPayload<T extends ContentSourceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContentSourceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContentSourceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContentSourceGroupByOutputType[P]>
            : GetScalarType<T[P], ContentSourceGroupByOutputType[P]>
        }
      >
    >


  export type ContentSourceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    url?: boolean
    refreshIntervalMins?: boolean
    lastFetchedAt?: boolean
    isActive?: boolean
    items?: boolean | ContentSource$itemsArgs<ExtArgs>
    _count?: boolean | ContentSourceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contentSource"]>

  export type ContentSourceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    url?: boolean
    refreshIntervalMins?: boolean
    lastFetchedAt?: boolean
    isActive?: boolean
  }, ExtArgs["result"]["contentSource"]>

  export type ContentSourceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    url?: boolean
    refreshIntervalMins?: boolean
    lastFetchedAt?: boolean
    isActive?: boolean
  }, ExtArgs["result"]["contentSource"]>

  export type ContentSourceSelectScalar = {
    id?: boolean
    name?: boolean
    type?: boolean
    url?: boolean
    refreshIntervalMins?: boolean
    lastFetchedAt?: boolean
    isActive?: boolean
  }

  export type ContentSourceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "type" | "url" | "refreshIntervalMins" | "lastFetchedAt" | "isActive", ExtArgs["result"]["contentSource"]>
  export type ContentSourceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | ContentSource$itemsArgs<ExtArgs>
    _count?: boolean | ContentSourceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ContentSourceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ContentSourceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ContentSourcePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContentSource"
    objects: {
      items: Prisma.$ContentItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      /**
       * "rss" | "youtube_channel" | "podcast_feed"
       */
      type: string
      url: string
      refreshIntervalMins: number
      lastFetchedAt: Date | null
      isActive: boolean
    }, ExtArgs["result"]["contentSource"]>
    composites: {}
  }

  type ContentSourceGetPayload<S extends boolean | null | undefined | ContentSourceDefaultArgs> = $Result.GetResult<Prisma.$ContentSourcePayload, S>

  type ContentSourceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContentSourceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContentSourceCountAggregateInputType | true
    }

  export interface ContentSourceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContentSource'], meta: { name: 'ContentSource' } }
    /**
     * Find zero or one ContentSource that matches the filter.
     * @param {ContentSourceFindUniqueArgs} args - Arguments to find a ContentSource
     * @example
     * // Get one ContentSource
     * const contentSource = await prisma.contentSource.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContentSourceFindUniqueArgs>(args: SelectSubset<T, ContentSourceFindUniqueArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ContentSource that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContentSourceFindUniqueOrThrowArgs} args - Arguments to find a ContentSource
     * @example
     * // Get one ContentSource
     * const contentSource = await prisma.contentSource.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContentSourceFindUniqueOrThrowArgs>(args: SelectSubset<T, ContentSourceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContentSource that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceFindFirstArgs} args - Arguments to find a ContentSource
     * @example
     * // Get one ContentSource
     * const contentSource = await prisma.contentSource.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContentSourceFindFirstArgs>(args?: SelectSubset<T, ContentSourceFindFirstArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContentSource that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceFindFirstOrThrowArgs} args - Arguments to find a ContentSource
     * @example
     * // Get one ContentSource
     * const contentSource = await prisma.contentSource.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContentSourceFindFirstOrThrowArgs>(args?: SelectSubset<T, ContentSourceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ContentSources that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContentSources
     * const contentSources = await prisma.contentSource.findMany()
     * 
     * // Get first 10 ContentSources
     * const contentSources = await prisma.contentSource.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contentSourceWithIdOnly = await prisma.contentSource.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContentSourceFindManyArgs>(args?: SelectSubset<T, ContentSourceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ContentSource.
     * @param {ContentSourceCreateArgs} args - Arguments to create a ContentSource.
     * @example
     * // Create one ContentSource
     * const ContentSource = await prisma.contentSource.create({
     *   data: {
     *     // ... data to create a ContentSource
     *   }
     * })
     * 
     */
    create<T extends ContentSourceCreateArgs>(args: SelectSubset<T, ContentSourceCreateArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ContentSources.
     * @param {ContentSourceCreateManyArgs} args - Arguments to create many ContentSources.
     * @example
     * // Create many ContentSources
     * const contentSource = await prisma.contentSource.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContentSourceCreateManyArgs>(args?: SelectSubset<T, ContentSourceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ContentSources and returns the data saved in the database.
     * @param {ContentSourceCreateManyAndReturnArgs} args - Arguments to create many ContentSources.
     * @example
     * // Create many ContentSources
     * const contentSource = await prisma.contentSource.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ContentSources and only return the `id`
     * const contentSourceWithIdOnly = await prisma.contentSource.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContentSourceCreateManyAndReturnArgs>(args?: SelectSubset<T, ContentSourceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ContentSource.
     * @param {ContentSourceDeleteArgs} args - Arguments to delete one ContentSource.
     * @example
     * // Delete one ContentSource
     * const ContentSource = await prisma.contentSource.delete({
     *   where: {
     *     // ... filter to delete one ContentSource
     *   }
     * })
     * 
     */
    delete<T extends ContentSourceDeleteArgs>(args: SelectSubset<T, ContentSourceDeleteArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ContentSource.
     * @param {ContentSourceUpdateArgs} args - Arguments to update one ContentSource.
     * @example
     * // Update one ContentSource
     * const contentSource = await prisma.contentSource.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContentSourceUpdateArgs>(args: SelectSubset<T, ContentSourceUpdateArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ContentSources.
     * @param {ContentSourceDeleteManyArgs} args - Arguments to filter ContentSources to delete.
     * @example
     * // Delete a few ContentSources
     * const { count } = await prisma.contentSource.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContentSourceDeleteManyArgs>(args?: SelectSubset<T, ContentSourceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContentSources.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContentSources
     * const contentSource = await prisma.contentSource.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContentSourceUpdateManyArgs>(args: SelectSubset<T, ContentSourceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContentSources and returns the data updated in the database.
     * @param {ContentSourceUpdateManyAndReturnArgs} args - Arguments to update many ContentSources.
     * @example
     * // Update many ContentSources
     * const contentSource = await prisma.contentSource.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ContentSources and only return the `id`
     * const contentSourceWithIdOnly = await prisma.contentSource.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ContentSourceUpdateManyAndReturnArgs>(args: SelectSubset<T, ContentSourceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ContentSource.
     * @param {ContentSourceUpsertArgs} args - Arguments to update or create a ContentSource.
     * @example
     * // Update or create a ContentSource
     * const contentSource = await prisma.contentSource.upsert({
     *   create: {
     *     // ... data to create a ContentSource
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContentSource we want to update
     *   }
     * })
     */
    upsert<T extends ContentSourceUpsertArgs>(args: SelectSubset<T, ContentSourceUpsertArgs<ExtArgs>>): Prisma__ContentSourceClient<$Result.GetResult<Prisma.$ContentSourcePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ContentSources.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceCountArgs} args - Arguments to filter ContentSources to count.
     * @example
     * // Count the number of ContentSources
     * const count = await prisma.contentSource.count({
     *   where: {
     *     // ... the filter for the ContentSources we want to count
     *   }
     * })
    **/
    count<T extends ContentSourceCountArgs>(
      args?: Subset<T, ContentSourceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContentSourceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContentSource.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContentSourceAggregateArgs>(args: Subset<T, ContentSourceAggregateArgs>): Prisma.PrismaPromise<GetContentSourceAggregateType<T>>

    /**
     * Group by ContentSource.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContentSourceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContentSourceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContentSourceGroupByArgs['orderBy'] }
        : { orderBy?: ContentSourceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContentSourceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContentSourceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContentSource model
   */
  readonly fields: ContentSourceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContentSource.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContentSourceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    items<T extends ContentSource$itemsArgs<ExtArgs> = {}>(args?: Subset<T, ContentSource$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContentItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ContentSource model
   */
  interface ContentSourceFieldRefs {
    readonly id: FieldRef<"ContentSource", 'String'>
    readonly name: FieldRef<"ContentSource", 'String'>
    readonly type: FieldRef<"ContentSource", 'String'>
    readonly url: FieldRef<"ContentSource", 'String'>
    readonly refreshIntervalMins: FieldRef<"ContentSource", 'Int'>
    readonly lastFetchedAt: FieldRef<"ContentSource", 'DateTime'>
    readonly isActive: FieldRef<"ContentSource", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * ContentSource findUnique
   */
  export type ContentSourceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * Filter, which ContentSource to fetch.
     */
    where: ContentSourceWhereUniqueInput
  }

  /**
   * ContentSource findUniqueOrThrow
   */
  export type ContentSourceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * Filter, which ContentSource to fetch.
     */
    where: ContentSourceWhereUniqueInput
  }

  /**
   * ContentSource findFirst
   */
  export type ContentSourceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * Filter, which ContentSource to fetch.
     */
    where?: ContentSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentSources to fetch.
     */
    orderBy?: ContentSourceOrderByWithRelationInput | ContentSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContentSources.
     */
    cursor?: ContentSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentSources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContentSources.
     */
    distinct?: ContentSourceScalarFieldEnum | ContentSourceScalarFieldEnum[]
  }

  /**
   * ContentSource findFirstOrThrow
   */
  export type ContentSourceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * Filter, which ContentSource to fetch.
     */
    where?: ContentSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentSources to fetch.
     */
    orderBy?: ContentSourceOrderByWithRelationInput | ContentSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContentSources.
     */
    cursor?: ContentSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentSources.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContentSources.
     */
    distinct?: ContentSourceScalarFieldEnum | ContentSourceScalarFieldEnum[]
  }

  /**
   * ContentSource findMany
   */
  export type ContentSourceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * Filter, which ContentSources to fetch.
     */
    where?: ContentSourceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContentSources to fetch.
     */
    orderBy?: ContentSourceOrderByWithRelationInput | ContentSourceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContentSources.
     */
    cursor?: ContentSourceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContentSources from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContentSources.
     */
    skip?: number
    distinct?: ContentSourceScalarFieldEnum | ContentSourceScalarFieldEnum[]
  }

  /**
   * ContentSource create
   */
  export type ContentSourceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * The data needed to create a ContentSource.
     */
    data: XOR<ContentSourceCreateInput, ContentSourceUncheckedCreateInput>
  }

  /**
   * ContentSource createMany
   */
  export type ContentSourceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContentSources.
     */
    data: ContentSourceCreateManyInput | ContentSourceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContentSource createManyAndReturn
   */
  export type ContentSourceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * The data used to create many ContentSources.
     */
    data: ContentSourceCreateManyInput | ContentSourceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContentSource update
   */
  export type ContentSourceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * The data needed to update a ContentSource.
     */
    data: XOR<ContentSourceUpdateInput, ContentSourceUncheckedUpdateInput>
    /**
     * Choose, which ContentSource to update.
     */
    where: ContentSourceWhereUniqueInput
  }

  /**
   * ContentSource updateMany
   */
  export type ContentSourceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContentSources.
     */
    data: XOR<ContentSourceUpdateManyMutationInput, ContentSourceUncheckedUpdateManyInput>
    /**
     * Filter which ContentSources to update
     */
    where?: ContentSourceWhereInput
    /**
     * Limit how many ContentSources to update.
     */
    limit?: number
  }

  /**
   * ContentSource updateManyAndReturn
   */
  export type ContentSourceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * The data used to update ContentSources.
     */
    data: XOR<ContentSourceUpdateManyMutationInput, ContentSourceUncheckedUpdateManyInput>
    /**
     * Filter which ContentSources to update
     */
    where?: ContentSourceWhereInput
    /**
     * Limit how many ContentSources to update.
     */
    limit?: number
  }

  /**
   * ContentSource upsert
   */
  export type ContentSourceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * The filter to search for the ContentSource to update in case it exists.
     */
    where: ContentSourceWhereUniqueInput
    /**
     * In case the ContentSource found by the `where` argument doesn't exist, create a new ContentSource with this data.
     */
    create: XOR<ContentSourceCreateInput, ContentSourceUncheckedCreateInput>
    /**
     * In case the ContentSource was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContentSourceUpdateInput, ContentSourceUncheckedUpdateInput>
  }

  /**
   * ContentSource delete
   */
  export type ContentSourceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
    /**
     * Filter which ContentSource to delete.
     */
    where: ContentSourceWhereUniqueInput
  }

  /**
   * ContentSource deleteMany
   */
  export type ContentSourceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContentSources to delete
     */
    where?: ContentSourceWhereInput
    /**
     * Limit how many ContentSources to delete.
     */
    limit?: number
  }

  /**
   * ContentSource.items
   */
  export type ContentSource$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentItem
     */
    select?: ContentItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentItem
     */
    omit?: ContentItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentItemInclude<ExtArgs> | null
    where?: ContentItemWhereInput
    orderBy?: ContentItemOrderByWithRelationInput | ContentItemOrderByWithRelationInput[]
    cursor?: ContentItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContentItemScalarFieldEnum | ContentItemScalarFieldEnum[]
  }

  /**
   * ContentSource without action
   */
  export type ContentSourceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContentSource
     */
    select?: ContentSourceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContentSource
     */
    omit?: ContentSourceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContentSourceInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    clerkId: 'clerkId',
    email: 'email',
    tier: 'tier',
    role: 'role',
    runCredits: 'runCredits',
    stripeCustomerId: 'stripeCustomerId',
    stripeSubscriptionId: 'stripeSubscriptionId',
    stripeSubscriptionStatus: 'stripeSubscriptionStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SleeperProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    sleeperId: 'sleeperId',
    displayName: 'displayName',
    leagues: 'leagues',
    updatedAt: 'updatedAt'
  };

  export type SleeperProfileScalarFieldEnum = (typeof SleeperProfileScalarFieldEnum)[keyof typeof SleeperProfileScalarFieldEnum]


  export const UserPreferencesScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    leagueStyle: 'leagueStyle',
    scoringPriority: 'scoringPriority',
    playStyle: 'playStyle',
    reportFormat: 'reportFormat',
    priorityPositions: 'priorityPositions',
    customInstructions: 'customInstructions',
    notifyOnInjury: 'notifyOnInjury',
    notifyOnTrending: 'notifyOnTrending',
    updatedAt: 'updatedAt'
  };

  export type UserPreferencesScalarFieldEnum = (typeof UserPreferencesScalarFieldEnum)[keyof typeof UserPreferencesScalarFieldEnum]


  export const AgentRunScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    agentType: 'agentType',
    status: 'status',
    inputJson: 'inputJson',
    outputJson: 'outputJson',
    tokensUsed: 'tokensUsed',
    durationMs: 'durationMs',
    rating: 'rating',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AgentRunScalarFieldEnum = (typeof AgentRunScalarFieldEnum)[keyof typeof AgentRunScalarFieldEnum]


  export const TokenBudgetScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    periodStart: 'periodStart',
    tokensUsed: 'tokensUsed',
    runsUsed: 'runsUsed'
  };

  export type TokenBudgetScalarFieldEnum = (typeof TokenBudgetScalarFieldEnum)[keyof typeof TokenBudgetScalarFieldEnum]


  export const AnalyticsEventScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    eventType: 'eventType',
    payload: 'payload',
    createdAt: 'createdAt'
  };

  export type AnalyticsEventScalarFieldEnum = (typeof AnalyticsEventScalarFieldEnum)[keyof typeof AnalyticsEventScalarFieldEnum]


  export const PlayerScalarFieldEnum: {
    sleeperId: 'sleeperId',
    firstName: 'firstName',
    lastName: 'lastName',
    position: 'position',
    team: 'team',
    status: 'status',
    injuryStatus: 'injuryStatus',
    practiceParticipation: 'practiceParticipation',
    depthChartPosition: 'depthChartPosition',
    depthChartOrder: 'depthChartOrder',
    searchRank: 'searchRank',
    age: 'age',
    yearsExp: 'yearsExp',
    metadata: 'metadata',
    lastRefreshedAt: 'lastRefreshedAt'
  };

  export type PlayerScalarFieldEnum = (typeof PlayerScalarFieldEnum)[keyof typeof PlayerScalarFieldEnum]


  export const PlayerRankingScalarFieldEnum: {
    id: 'id',
    playerId: 'playerId',
    source: 'source',
    rankOverall: 'rankOverall',
    rankPosition: 'rankPosition',
    week: 'week',
    season: 'season',
    fetchedAt: 'fetchedAt'
  };

  export type PlayerRankingScalarFieldEnum = (typeof PlayerRankingScalarFieldEnum)[keyof typeof PlayerRankingScalarFieldEnum]


  export const TrendingPlayerScalarFieldEnum: {
    id: 'id',
    playerId: 'playerId',
    type: 'type',
    count: 'count',
    lookbackHours: 'lookbackHours',
    fetchedAt: 'fetchedAt'
  };

  export type TrendingPlayerScalarFieldEnum = (typeof TrendingPlayerScalarFieldEnum)[keyof typeof TrendingPlayerScalarFieldEnum]


  export const ContentItemScalarFieldEnum: {
    id: 'id',
    sourceType: 'sourceType',
    sourceUrl: 'sourceUrl',
    title: 'title',
    publishedAt: 'publishedAt',
    authorName: 'authorName',
    rawContent: 'rawContent',
    extractedFacts: 'extractedFacts',
    playerIds: 'playerIds',
    teamSlugs: 'teamSlugs',
    topics: 'topics',
    importanceScore: 'importanceScore',
    noveltyScore: 'noveltyScore',
    fetchedAt: 'fetchedAt',
    sourceId: 'sourceId'
  };

  export type ContentItemScalarFieldEnum = (typeof ContentItemScalarFieldEnum)[keyof typeof ContentItemScalarFieldEnum]


  export const ContentSourceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    url: 'url',
    refreshIntervalMins: 'refreshIntervalMins',
    lastFetchedAt: 'lastFetchedAt',
    isActive: 'isActive'
  };

  export type ContentSourceScalarFieldEnum = (typeof ContentSourceScalarFieldEnum)[keyof typeof ContentSourceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserTier'
   */
  export type EnumUserTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserTier'>
    


  /**
   * Reference to a field of type 'UserTier[]'
   */
  export type ListEnumUserTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserTier[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'LeagueStyle'
   */
  export type EnumLeagueStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeagueStyle'>
    


  /**
   * Reference to a field of type 'LeagueStyle[]'
   */
  export type ListEnumLeagueStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeagueStyle[]'>
    


  /**
   * Reference to a field of type 'ScoringPriority'
   */
  export type EnumScoringPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScoringPriority'>
    


  /**
   * Reference to a field of type 'ScoringPriority[]'
   */
  export type ListEnumScoringPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScoringPriority[]'>
    


  /**
   * Reference to a field of type 'PlayStyle'
   */
  export type EnumPlayStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlayStyle'>
    


  /**
   * Reference to a field of type 'PlayStyle[]'
   */
  export type ListEnumPlayStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlayStyle[]'>
    


  /**
   * Reference to a field of type 'ReportFormat'
   */
  export type EnumReportFormatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReportFormat'>
    


  /**
   * Reference to a field of type 'ReportFormat[]'
   */
  export type ListEnumReportFormatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReportFormat[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'AgentRunStatus'
   */
  export type EnumAgentRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AgentRunStatus'>
    


  /**
   * Reference to a field of type 'AgentRunStatus[]'
   */
  export type ListEnumAgentRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AgentRunStatus[]'>
    


  /**
   * Reference to a field of type 'AgentResultRating'
   */
  export type EnumAgentResultRatingFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AgentResultRating'>
    


  /**
   * Reference to a field of type 'AgentResultRating[]'
   */
  export type ListEnumAgentResultRatingFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AgentResultRating[]'>
    


  /**
   * Reference to a field of type 'TrendingType'
   */
  export type EnumTrendingTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrendingType'>
    


  /**
   * Reference to a field of type 'TrendingType[]'
   */
  export type ListEnumTrendingTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrendingType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    clerkId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    tier?: EnumUserTierFilter<"User"> | $Enums.UserTier
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    runCredits?: IntFilter<"User"> | number
    stripeCustomerId?: StringNullableFilter<"User"> | string | null
    stripeSubscriptionId?: StringNullableFilter<"User"> | string | null
    stripeSubscriptionStatus?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    sleeperProfile?: XOR<SleeperProfileNullableScalarRelationFilter, SleeperProfileWhereInput> | null
    preferences?: XOR<UserPreferencesNullableScalarRelationFilter, UserPreferencesWhereInput> | null
    agentRuns?: AgentRunListRelationFilter
    tokenBudget?: TokenBudgetListRelationFilter
    analyticsEvents?: AnalyticsEventListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    runCredits?: SortOrder
    stripeCustomerId?: SortOrderInput | SortOrder
    stripeSubscriptionId?: SortOrderInput | SortOrder
    stripeSubscriptionStatus?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sleeperProfile?: SleeperProfileOrderByWithRelationInput
    preferences?: UserPreferencesOrderByWithRelationInput
    agentRuns?: AgentRunOrderByRelationAggregateInput
    tokenBudget?: TokenBudgetOrderByRelationAggregateInput
    analyticsEvents?: AnalyticsEventOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clerkId?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    tier?: EnumUserTierFilter<"User"> | $Enums.UserTier
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    runCredits?: IntFilter<"User"> | number
    stripeCustomerId?: StringNullableFilter<"User"> | string | null
    stripeSubscriptionId?: StringNullableFilter<"User"> | string | null
    stripeSubscriptionStatus?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    sleeperProfile?: XOR<SleeperProfileNullableScalarRelationFilter, SleeperProfileWhereInput> | null
    preferences?: XOR<UserPreferencesNullableScalarRelationFilter, UserPreferencesWhereInput> | null
    agentRuns?: AgentRunListRelationFilter
    tokenBudget?: TokenBudgetListRelationFilter
    analyticsEvents?: AnalyticsEventListRelationFilter
  }, "id" | "clerkId" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    runCredits?: SortOrder
    stripeCustomerId?: SortOrderInput | SortOrder
    stripeSubscriptionId?: SortOrderInput | SortOrder
    stripeSubscriptionStatus?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    clerkId?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    tier?: EnumUserTierWithAggregatesFilter<"User"> | $Enums.UserTier
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    runCredits?: IntWithAggregatesFilter<"User"> | number
    stripeCustomerId?: StringNullableWithAggregatesFilter<"User"> | string | null
    stripeSubscriptionId?: StringNullableWithAggregatesFilter<"User"> | string | null
    stripeSubscriptionStatus?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type SleeperProfileWhereInput = {
    AND?: SleeperProfileWhereInput | SleeperProfileWhereInput[]
    OR?: SleeperProfileWhereInput[]
    NOT?: SleeperProfileWhereInput | SleeperProfileWhereInput[]
    id?: StringFilter<"SleeperProfile"> | string
    userId?: StringFilter<"SleeperProfile"> | string
    sleeperId?: StringFilter<"SleeperProfile"> | string
    displayName?: StringFilter<"SleeperProfile"> | string
    leagues?: JsonFilter<"SleeperProfile">
    updatedAt?: DateTimeFilter<"SleeperProfile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SleeperProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    sleeperId?: SortOrder
    displayName?: SortOrder
    leagues?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SleeperProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: SleeperProfileWhereInput | SleeperProfileWhereInput[]
    OR?: SleeperProfileWhereInput[]
    NOT?: SleeperProfileWhereInput | SleeperProfileWhereInput[]
    sleeperId?: StringFilter<"SleeperProfile"> | string
    displayName?: StringFilter<"SleeperProfile"> | string
    leagues?: JsonFilter<"SleeperProfile">
    updatedAt?: DateTimeFilter<"SleeperProfile"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type SleeperProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    sleeperId?: SortOrder
    displayName?: SortOrder
    leagues?: SortOrder
    updatedAt?: SortOrder
    _count?: SleeperProfileCountOrderByAggregateInput
    _max?: SleeperProfileMaxOrderByAggregateInput
    _min?: SleeperProfileMinOrderByAggregateInput
  }

  export type SleeperProfileScalarWhereWithAggregatesInput = {
    AND?: SleeperProfileScalarWhereWithAggregatesInput | SleeperProfileScalarWhereWithAggregatesInput[]
    OR?: SleeperProfileScalarWhereWithAggregatesInput[]
    NOT?: SleeperProfileScalarWhereWithAggregatesInput | SleeperProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SleeperProfile"> | string
    userId?: StringWithAggregatesFilter<"SleeperProfile"> | string
    sleeperId?: StringWithAggregatesFilter<"SleeperProfile"> | string
    displayName?: StringWithAggregatesFilter<"SleeperProfile"> | string
    leagues?: JsonWithAggregatesFilter<"SleeperProfile">
    updatedAt?: DateTimeWithAggregatesFilter<"SleeperProfile"> | Date | string
  }

  export type UserPreferencesWhereInput = {
    AND?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    OR?: UserPreferencesWhereInput[]
    NOT?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    id?: StringFilter<"UserPreferences"> | string
    userId?: StringFilter<"UserPreferences"> | string
    leagueStyle?: EnumLeagueStyleFilter<"UserPreferences"> | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFilter<"UserPreferences"> | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFilter<"UserPreferences"> | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFilter<"UserPreferences"> | $Enums.ReportFormat
    priorityPositions?: StringNullableListFilter<"UserPreferences">
    customInstructions?: StringNullableFilter<"UserPreferences"> | string | null
    notifyOnInjury?: BoolFilter<"UserPreferences"> | boolean
    notifyOnTrending?: BoolFilter<"UserPreferences"> | boolean
    updatedAt?: DateTimeFilter<"UserPreferences"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserPreferencesOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    leagueStyle?: SortOrder
    scoringPriority?: SortOrder
    playStyle?: SortOrder
    reportFormat?: SortOrder
    priorityPositions?: SortOrder
    customInstructions?: SortOrderInput | SortOrder
    notifyOnInjury?: SortOrder
    notifyOnTrending?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserPreferencesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    OR?: UserPreferencesWhereInput[]
    NOT?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    leagueStyle?: EnumLeagueStyleFilter<"UserPreferences"> | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFilter<"UserPreferences"> | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFilter<"UserPreferences"> | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFilter<"UserPreferences"> | $Enums.ReportFormat
    priorityPositions?: StringNullableListFilter<"UserPreferences">
    customInstructions?: StringNullableFilter<"UserPreferences"> | string | null
    notifyOnInjury?: BoolFilter<"UserPreferences"> | boolean
    notifyOnTrending?: BoolFilter<"UserPreferences"> | boolean
    updatedAt?: DateTimeFilter<"UserPreferences"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type UserPreferencesOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    leagueStyle?: SortOrder
    scoringPriority?: SortOrder
    playStyle?: SortOrder
    reportFormat?: SortOrder
    priorityPositions?: SortOrder
    customInstructions?: SortOrderInput | SortOrder
    notifyOnInjury?: SortOrder
    notifyOnTrending?: SortOrder
    updatedAt?: SortOrder
    _count?: UserPreferencesCountOrderByAggregateInput
    _max?: UserPreferencesMaxOrderByAggregateInput
    _min?: UserPreferencesMinOrderByAggregateInput
  }

  export type UserPreferencesScalarWhereWithAggregatesInput = {
    AND?: UserPreferencesScalarWhereWithAggregatesInput | UserPreferencesScalarWhereWithAggregatesInput[]
    OR?: UserPreferencesScalarWhereWithAggregatesInput[]
    NOT?: UserPreferencesScalarWhereWithAggregatesInput | UserPreferencesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserPreferences"> | string
    userId?: StringWithAggregatesFilter<"UserPreferences"> | string
    leagueStyle?: EnumLeagueStyleWithAggregatesFilter<"UserPreferences"> | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityWithAggregatesFilter<"UserPreferences"> | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleWithAggregatesFilter<"UserPreferences"> | $Enums.PlayStyle
    reportFormat?: EnumReportFormatWithAggregatesFilter<"UserPreferences"> | $Enums.ReportFormat
    priorityPositions?: StringNullableListFilter<"UserPreferences">
    customInstructions?: StringNullableWithAggregatesFilter<"UserPreferences"> | string | null
    notifyOnInjury?: BoolWithAggregatesFilter<"UserPreferences"> | boolean
    notifyOnTrending?: BoolWithAggregatesFilter<"UserPreferences"> | boolean
    updatedAt?: DateTimeWithAggregatesFilter<"UserPreferences"> | Date | string
  }

  export type AgentRunWhereInput = {
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    userId?: StringFilter<"AgentRun"> | string
    agentType?: StringFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusFilter<"AgentRun"> | $Enums.AgentRunStatus
    inputJson?: JsonFilter<"AgentRun">
    outputJson?: JsonNullableFilter<"AgentRun">
    tokensUsed?: IntNullableFilter<"AgentRun"> | number | null
    durationMs?: IntNullableFilter<"AgentRun"> | number | null
    rating?: EnumAgentResultRatingNullableFilter<"AgentRun"> | $Enums.AgentResultRating | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AgentRunOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputJson?: SortOrder
    outputJson?: SortOrderInput | SortOrder
    tokensUsed?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    rating?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AgentRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    userId?: StringFilter<"AgentRun"> | string
    agentType?: StringFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusFilter<"AgentRun"> | $Enums.AgentRunStatus
    inputJson?: JsonFilter<"AgentRun">
    outputJson?: JsonNullableFilter<"AgentRun">
    tokensUsed?: IntNullableFilter<"AgentRun"> | number | null
    durationMs?: IntNullableFilter<"AgentRun"> | number | null
    rating?: EnumAgentResultRatingNullableFilter<"AgentRun"> | $Enums.AgentResultRating | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AgentRunOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputJson?: SortOrder
    outputJson?: SortOrderInput | SortOrder
    tokensUsed?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    rating?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AgentRunCountOrderByAggregateInput
    _avg?: AgentRunAvgOrderByAggregateInput
    _max?: AgentRunMaxOrderByAggregateInput
    _min?: AgentRunMinOrderByAggregateInput
    _sum?: AgentRunSumOrderByAggregateInput
  }

  export type AgentRunScalarWhereWithAggregatesInput = {
    AND?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    OR?: AgentRunScalarWhereWithAggregatesInput[]
    NOT?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentRun"> | string
    userId?: StringWithAggregatesFilter<"AgentRun"> | string
    agentType?: StringWithAggregatesFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusWithAggregatesFilter<"AgentRun"> | $Enums.AgentRunStatus
    inputJson?: JsonWithAggregatesFilter<"AgentRun">
    outputJson?: JsonNullableWithAggregatesFilter<"AgentRun">
    tokensUsed?: IntNullableWithAggregatesFilter<"AgentRun"> | number | null
    durationMs?: IntNullableWithAggregatesFilter<"AgentRun"> | number | null
    rating?: EnumAgentResultRatingNullableWithAggregatesFilter<"AgentRun"> | $Enums.AgentResultRating | null
    errorMessage?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
  }

  export type TokenBudgetWhereInput = {
    AND?: TokenBudgetWhereInput | TokenBudgetWhereInput[]
    OR?: TokenBudgetWhereInput[]
    NOT?: TokenBudgetWhereInput | TokenBudgetWhereInput[]
    id?: StringFilter<"TokenBudget"> | string
    userId?: StringFilter<"TokenBudget"> | string
    periodStart?: DateTimeFilter<"TokenBudget"> | Date | string
    tokensUsed?: IntFilter<"TokenBudget"> | number
    runsUsed?: IntFilter<"TokenBudget"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type TokenBudgetOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    periodStart?: SortOrder
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type TokenBudgetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_periodStart?: TokenBudgetUserIdPeriodStartCompoundUniqueInput
    AND?: TokenBudgetWhereInput | TokenBudgetWhereInput[]
    OR?: TokenBudgetWhereInput[]
    NOT?: TokenBudgetWhereInput | TokenBudgetWhereInput[]
    userId?: StringFilter<"TokenBudget"> | string
    periodStart?: DateTimeFilter<"TokenBudget"> | Date | string
    tokensUsed?: IntFilter<"TokenBudget"> | number
    runsUsed?: IntFilter<"TokenBudget"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_periodStart">

  export type TokenBudgetOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    periodStart?: SortOrder
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
    _count?: TokenBudgetCountOrderByAggregateInput
    _avg?: TokenBudgetAvgOrderByAggregateInput
    _max?: TokenBudgetMaxOrderByAggregateInput
    _min?: TokenBudgetMinOrderByAggregateInput
    _sum?: TokenBudgetSumOrderByAggregateInput
  }

  export type TokenBudgetScalarWhereWithAggregatesInput = {
    AND?: TokenBudgetScalarWhereWithAggregatesInput | TokenBudgetScalarWhereWithAggregatesInput[]
    OR?: TokenBudgetScalarWhereWithAggregatesInput[]
    NOT?: TokenBudgetScalarWhereWithAggregatesInput | TokenBudgetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TokenBudget"> | string
    userId?: StringWithAggregatesFilter<"TokenBudget"> | string
    periodStart?: DateTimeWithAggregatesFilter<"TokenBudget"> | Date | string
    tokensUsed?: IntWithAggregatesFilter<"TokenBudget"> | number
    runsUsed?: IntWithAggregatesFilter<"TokenBudget"> | number
  }

  export type AnalyticsEventWhereInput = {
    AND?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    OR?: AnalyticsEventWhereInput[]
    NOT?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    id?: StringFilter<"AnalyticsEvent"> | string
    userId?: StringNullableFilter<"AnalyticsEvent"> | string | null
    eventType?: StringFilter<"AnalyticsEvent"> | string
    payload?: JsonFilter<"AnalyticsEvent">
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type AnalyticsEventOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AnalyticsEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    OR?: AnalyticsEventWhereInput[]
    NOT?: AnalyticsEventWhereInput | AnalyticsEventWhereInput[]
    userId?: StringNullableFilter<"AnalyticsEvent"> | string | null
    eventType?: StringFilter<"AnalyticsEvent"> | string
    payload?: JsonFilter<"AnalyticsEvent">
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type AnalyticsEventOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
    _count?: AnalyticsEventCountOrderByAggregateInput
    _max?: AnalyticsEventMaxOrderByAggregateInput
    _min?: AnalyticsEventMinOrderByAggregateInput
  }

  export type AnalyticsEventScalarWhereWithAggregatesInput = {
    AND?: AnalyticsEventScalarWhereWithAggregatesInput | AnalyticsEventScalarWhereWithAggregatesInput[]
    OR?: AnalyticsEventScalarWhereWithAggregatesInput[]
    NOT?: AnalyticsEventScalarWhereWithAggregatesInput | AnalyticsEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AnalyticsEvent"> | string
    userId?: StringNullableWithAggregatesFilter<"AnalyticsEvent"> | string | null
    eventType?: StringWithAggregatesFilter<"AnalyticsEvent"> | string
    payload?: JsonWithAggregatesFilter<"AnalyticsEvent">
    createdAt?: DateTimeWithAggregatesFilter<"AnalyticsEvent"> | Date | string
  }

  export type PlayerWhereInput = {
    AND?: PlayerWhereInput | PlayerWhereInput[]
    OR?: PlayerWhereInput[]
    NOT?: PlayerWhereInput | PlayerWhereInput[]
    sleeperId?: StringFilter<"Player"> | string
    firstName?: StringFilter<"Player"> | string
    lastName?: StringFilter<"Player"> | string
    position?: StringFilter<"Player"> | string
    team?: StringNullableFilter<"Player"> | string | null
    status?: StringFilter<"Player"> | string
    injuryStatus?: StringNullableFilter<"Player"> | string | null
    practiceParticipation?: StringNullableFilter<"Player"> | string | null
    depthChartPosition?: StringNullableFilter<"Player"> | string | null
    depthChartOrder?: IntNullableFilter<"Player"> | number | null
    searchRank?: IntNullableFilter<"Player"> | number | null
    age?: IntNullableFilter<"Player"> | number | null
    yearsExp?: IntNullableFilter<"Player"> | number | null
    metadata?: JsonFilter<"Player">
    lastRefreshedAt?: DateTimeFilter<"Player"> | Date | string
    rankings?: PlayerRankingListRelationFilter
    trending?: TrendingPlayerListRelationFilter
  }

  export type PlayerOrderByWithRelationInput = {
    sleeperId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    position?: SortOrder
    team?: SortOrderInput | SortOrder
    status?: SortOrder
    injuryStatus?: SortOrderInput | SortOrder
    practiceParticipation?: SortOrderInput | SortOrder
    depthChartPosition?: SortOrderInput | SortOrder
    depthChartOrder?: SortOrderInput | SortOrder
    searchRank?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    yearsExp?: SortOrderInput | SortOrder
    metadata?: SortOrder
    lastRefreshedAt?: SortOrder
    rankings?: PlayerRankingOrderByRelationAggregateInput
    trending?: TrendingPlayerOrderByRelationAggregateInput
  }

  export type PlayerWhereUniqueInput = Prisma.AtLeast<{
    sleeperId?: string
    AND?: PlayerWhereInput | PlayerWhereInput[]
    OR?: PlayerWhereInput[]
    NOT?: PlayerWhereInput | PlayerWhereInput[]
    firstName?: StringFilter<"Player"> | string
    lastName?: StringFilter<"Player"> | string
    position?: StringFilter<"Player"> | string
    team?: StringNullableFilter<"Player"> | string | null
    status?: StringFilter<"Player"> | string
    injuryStatus?: StringNullableFilter<"Player"> | string | null
    practiceParticipation?: StringNullableFilter<"Player"> | string | null
    depthChartPosition?: StringNullableFilter<"Player"> | string | null
    depthChartOrder?: IntNullableFilter<"Player"> | number | null
    searchRank?: IntNullableFilter<"Player"> | number | null
    age?: IntNullableFilter<"Player"> | number | null
    yearsExp?: IntNullableFilter<"Player"> | number | null
    metadata?: JsonFilter<"Player">
    lastRefreshedAt?: DateTimeFilter<"Player"> | Date | string
    rankings?: PlayerRankingListRelationFilter
    trending?: TrendingPlayerListRelationFilter
  }, "sleeperId">

  export type PlayerOrderByWithAggregationInput = {
    sleeperId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    position?: SortOrder
    team?: SortOrderInput | SortOrder
    status?: SortOrder
    injuryStatus?: SortOrderInput | SortOrder
    practiceParticipation?: SortOrderInput | SortOrder
    depthChartPosition?: SortOrderInput | SortOrder
    depthChartOrder?: SortOrderInput | SortOrder
    searchRank?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    yearsExp?: SortOrderInput | SortOrder
    metadata?: SortOrder
    lastRefreshedAt?: SortOrder
    _count?: PlayerCountOrderByAggregateInput
    _avg?: PlayerAvgOrderByAggregateInput
    _max?: PlayerMaxOrderByAggregateInput
    _min?: PlayerMinOrderByAggregateInput
    _sum?: PlayerSumOrderByAggregateInput
  }

  export type PlayerScalarWhereWithAggregatesInput = {
    AND?: PlayerScalarWhereWithAggregatesInput | PlayerScalarWhereWithAggregatesInput[]
    OR?: PlayerScalarWhereWithAggregatesInput[]
    NOT?: PlayerScalarWhereWithAggregatesInput | PlayerScalarWhereWithAggregatesInput[]
    sleeperId?: StringWithAggregatesFilter<"Player"> | string
    firstName?: StringWithAggregatesFilter<"Player"> | string
    lastName?: StringWithAggregatesFilter<"Player"> | string
    position?: StringWithAggregatesFilter<"Player"> | string
    team?: StringNullableWithAggregatesFilter<"Player"> | string | null
    status?: StringWithAggregatesFilter<"Player"> | string
    injuryStatus?: StringNullableWithAggregatesFilter<"Player"> | string | null
    practiceParticipation?: StringNullableWithAggregatesFilter<"Player"> | string | null
    depthChartPosition?: StringNullableWithAggregatesFilter<"Player"> | string | null
    depthChartOrder?: IntNullableWithAggregatesFilter<"Player"> | number | null
    searchRank?: IntNullableWithAggregatesFilter<"Player"> | number | null
    age?: IntNullableWithAggregatesFilter<"Player"> | number | null
    yearsExp?: IntNullableWithAggregatesFilter<"Player"> | number | null
    metadata?: JsonWithAggregatesFilter<"Player">
    lastRefreshedAt?: DateTimeWithAggregatesFilter<"Player"> | Date | string
  }

  export type PlayerRankingWhereInput = {
    AND?: PlayerRankingWhereInput | PlayerRankingWhereInput[]
    OR?: PlayerRankingWhereInput[]
    NOT?: PlayerRankingWhereInput | PlayerRankingWhereInput[]
    id?: StringFilter<"PlayerRanking"> | string
    playerId?: StringFilter<"PlayerRanking"> | string
    source?: StringFilter<"PlayerRanking"> | string
    rankOverall?: IntFilter<"PlayerRanking"> | number
    rankPosition?: IntFilter<"PlayerRanking"> | number
    week?: IntFilter<"PlayerRanking"> | number
    season?: IntFilter<"PlayerRanking"> | number
    fetchedAt?: DateTimeFilter<"PlayerRanking"> | Date | string
    player?: XOR<PlayerScalarRelationFilter, PlayerWhereInput>
  }

  export type PlayerRankingOrderByWithRelationInput = {
    id?: SortOrder
    playerId?: SortOrder
    source?: SortOrder
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
    fetchedAt?: SortOrder
    player?: PlayerOrderByWithRelationInput
  }

  export type PlayerRankingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    playerId_source_week_season?: PlayerRankingPlayerIdSourceWeekSeasonCompoundUniqueInput
    AND?: PlayerRankingWhereInput | PlayerRankingWhereInput[]
    OR?: PlayerRankingWhereInput[]
    NOT?: PlayerRankingWhereInput | PlayerRankingWhereInput[]
    playerId?: StringFilter<"PlayerRanking"> | string
    source?: StringFilter<"PlayerRanking"> | string
    rankOverall?: IntFilter<"PlayerRanking"> | number
    rankPosition?: IntFilter<"PlayerRanking"> | number
    week?: IntFilter<"PlayerRanking"> | number
    season?: IntFilter<"PlayerRanking"> | number
    fetchedAt?: DateTimeFilter<"PlayerRanking"> | Date | string
    player?: XOR<PlayerScalarRelationFilter, PlayerWhereInput>
  }, "id" | "playerId_source_week_season">

  export type PlayerRankingOrderByWithAggregationInput = {
    id?: SortOrder
    playerId?: SortOrder
    source?: SortOrder
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
    fetchedAt?: SortOrder
    _count?: PlayerRankingCountOrderByAggregateInput
    _avg?: PlayerRankingAvgOrderByAggregateInput
    _max?: PlayerRankingMaxOrderByAggregateInput
    _min?: PlayerRankingMinOrderByAggregateInput
    _sum?: PlayerRankingSumOrderByAggregateInput
  }

  export type PlayerRankingScalarWhereWithAggregatesInput = {
    AND?: PlayerRankingScalarWhereWithAggregatesInput | PlayerRankingScalarWhereWithAggregatesInput[]
    OR?: PlayerRankingScalarWhereWithAggregatesInput[]
    NOT?: PlayerRankingScalarWhereWithAggregatesInput | PlayerRankingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlayerRanking"> | string
    playerId?: StringWithAggregatesFilter<"PlayerRanking"> | string
    source?: StringWithAggregatesFilter<"PlayerRanking"> | string
    rankOverall?: IntWithAggregatesFilter<"PlayerRanking"> | number
    rankPosition?: IntWithAggregatesFilter<"PlayerRanking"> | number
    week?: IntWithAggregatesFilter<"PlayerRanking"> | number
    season?: IntWithAggregatesFilter<"PlayerRanking"> | number
    fetchedAt?: DateTimeWithAggregatesFilter<"PlayerRanking"> | Date | string
  }

  export type TrendingPlayerWhereInput = {
    AND?: TrendingPlayerWhereInput | TrendingPlayerWhereInput[]
    OR?: TrendingPlayerWhereInput[]
    NOT?: TrendingPlayerWhereInput | TrendingPlayerWhereInput[]
    id?: StringFilter<"TrendingPlayer"> | string
    playerId?: StringFilter<"TrendingPlayer"> | string
    type?: EnumTrendingTypeFilter<"TrendingPlayer"> | $Enums.TrendingType
    count?: IntFilter<"TrendingPlayer"> | number
    lookbackHours?: IntFilter<"TrendingPlayer"> | number
    fetchedAt?: DateTimeFilter<"TrendingPlayer"> | Date | string
    player?: XOR<PlayerScalarRelationFilter, PlayerWhereInput>
  }

  export type TrendingPlayerOrderByWithRelationInput = {
    id?: SortOrder
    playerId?: SortOrder
    type?: SortOrder
    count?: SortOrder
    lookbackHours?: SortOrder
    fetchedAt?: SortOrder
    player?: PlayerOrderByWithRelationInput
  }

  export type TrendingPlayerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TrendingPlayerWhereInput | TrendingPlayerWhereInput[]
    OR?: TrendingPlayerWhereInput[]
    NOT?: TrendingPlayerWhereInput | TrendingPlayerWhereInput[]
    playerId?: StringFilter<"TrendingPlayer"> | string
    type?: EnumTrendingTypeFilter<"TrendingPlayer"> | $Enums.TrendingType
    count?: IntFilter<"TrendingPlayer"> | number
    lookbackHours?: IntFilter<"TrendingPlayer"> | number
    fetchedAt?: DateTimeFilter<"TrendingPlayer"> | Date | string
    player?: XOR<PlayerScalarRelationFilter, PlayerWhereInput>
  }, "id">

  export type TrendingPlayerOrderByWithAggregationInput = {
    id?: SortOrder
    playerId?: SortOrder
    type?: SortOrder
    count?: SortOrder
    lookbackHours?: SortOrder
    fetchedAt?: SortOrder
    _count?: TrendingPlayerCountOrderByAggregateInput
    _avg?: TrendingPlayerAvgOrderByAggregateInput
    _max?: TrendingPlayerMaxOrderByAggregateInput
    _min?: TrendingPlayerMinOrderByAggregateInput
    _sum?: TrendingPlayerSumOrderByAggregateInput
  }

  export type TrendingPlayerScalarWhereWithAggregatesInput = {
    AND?: TrendingPlayerScalarWhereWithAggregatesInput | TrendingPlayerScalarWhereWithAggregatesInput[]
    OR?: TrendingPlayerScalarWhereWithAggregatesInput[]
    NOT?: TrendingPlayerScalarWhereWithAggregatesInput | TrendingPlayerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrendingPlayer"> | string
    playerId?: StringWithAggregatesFilter<"TrendingPlayer"> | string
    type?: EnumTrendingTypeWithAggregatesFilter<"TrendingPlayer"> | $Enums.TrendingType
    count?: IntWithAggregatesFilter<"TrendingPlayer"> | number
    lookbackHours?: IntWithAggregatesFilter<"TrendingPlayer"> | number
    fetchedAt?: DateTimeWithAggregatesFilter<"TrendingPlayer"> | Date | string
  }

  export type ContentItemWhereInput = {
    AND?: ContentItemWhereInput | ContentItemWhereInput[]
    OR?: ContentItemWhereInput[]
    NOT?: ContentItemWhereInput | ContentItemWhereInput[]
    id?: StringFilter<"ContentItem"> | string
    sourceType?: StringFilter<"ContentItem"> | string
    sourceUrl?: StringFilter<"ContentItem"> | string
    title?: StringFilter<"ContentItem"> | string
    publishedAt?: DateTimeNullableFilter<"ContentItem"> | Date | string | null
    authorName?: StringNullableFilter<"ContentItem"> | string | null
    rawContent?: StringFilter<"ContentItem"> | string
    extractedFacts?: JsonFilter<"ContentItem">
    playerIds?: StringNullableListFilter<"ContentItem">
    teamSlugs?: StringNullableListFilter<"ContentItem">
    topics?: StringNullableListFilter<"ContentItem">
    importanceScore?: FloatNullableFilter<"ContentItem"> | number | null
    noveltyScore?: FloatNullableFilter<"ContentItem"> | number | null
    fetchedAt?: DateTimeFilter<"ContentItem"> | Date | string
    sourceId?: StringNullableFilter<"ContentItem"> | string | null
    source?: XOR<ContentSourceNullableScalarRelationFilter, ContentSourceWhereInput> | null
  }

  export type ContentItemOrderByWithRelationInput = {
    id?: SortOrder
    sourceType?: SortOrder
    sourceUrl?: SortOrder
    title?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    authorName?: SortOrderInput | SortOrder
    rawContent?: SortOrder
    extractedFacts?: SortOrder
    playerIds?: SortOrder
    teamSlugs?: SortOrder
    topics?: SortOrder
    importanceScore?: SortOrderInput | SortOrder
    noveltyScore?: SortOrderInput | SortOrder
    fetchedAt?: SortOrder
    sourceId?: SortOrderInput | SortOrder
    source?: ContentSourceOrderByWithRelationInput
  }

  export type ContentItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sourceUrl?: string
    AND?: ContentItemWhereInput | ContentItemWhereInput[]
    OR?: ContentItemWhereInput[]
    NOT?: ContentItemWhereInput | ContentItemWhereInput[]
    sourceType?: StringFilter<"ContentItem"> | string
    title?: StringFilter<"ContentItem"> | string
    publishedAt?: DateTimeNullableFilter<"ContentItem"> | Date | string | null
    authorName?: StringNullableFilter<"ContentItem"> | string | null
    rawContent?: StringFilter<"ContentItem"> | string
    extractedFacts?: JsonFilter<"ContentItem">
    playerIds?: StringNullableListFilter<"ContentItem">
    teamSlugs?: StringNullableListFilter<"ContentItem">
    topics?: StringNullableListFilter<"ContentItem">
    importanceScore?: FloatNullableFilter<"ContentItem"> | number | null
    noveltyScore?: FloatNullableFilter<"ContentItem"> | number | null
    fetchedAt?: DateTimeFilter<"ContentItem"> | Date | string
    sourceId?: StringNullableFilter<"ContentItem"> | string | null
    source?: XOR<ContentSourceNullableScalarRelationFilter, ContentSourceWhereInput> | null
  }, "id" | "sourceUrl">

  export type ContentItemOrderByWithAggregationInput = {
    id?: SortOrder
    sourceType?: SortOrder
    sourceUrl?: SortOrder
    title?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    authorName?: SortOrderInput | SortOrder
    rawContent?: SortOrder
    extractedFacts?: SortOrder
    playerIds?: SortOrder
    teamSlugs?: SortOrder
    topics?: SortOrder
    importanceScore?: SortOrderInput | SortOrder
    noveltyScore?: SortOrderInput | SortOrder
    fetchedAt?: SortOrder
    sourceId?: SortOrderInput | SortOrder
    _count?: ContentItemCountOrderByAggregateInput
    _avg?: ContentItemAvgOrderByAggregateInput
    _max?: ContentItemMaxOrderByAggregateInput
    _min?: ContentItemMinOrderByAggregateInput
    _sum?: ContentItemSumOrderByAggregateInput
  }

  export type ContentItemScalarWhereWithAggregatesInput = {
    AND?: ContentItemScalarWhereWithAggregatesInput | ContentItemScalarWhereWithAggregatesInput[]
    OR?: ContentItemScalarWhereWithAggregatesInput[]
    NOT?: ContentItemScalarWhereWithAggregatesInput | ContentItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ContentItem"> | string
    sourceType?: StringWithAggregatesFilter<"ContentItem"> | string
    sourceUrl?: StringWithAggregatesFilter<"ContentItem"> | string
    title?: StringWithAggregatesFilter<"ContentItem"> | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"ContentItem"> | Date | string | null
    authorName?: StringNullableWithAggregatesFilter<"ContentItem"> | string | null
    rawContent?: StringWithAggregatesFilter<"ContentItem"> | string
    extractedFacts?: JsonWithAggregatesFilter<"ContentItem">
    playerIds?: StringNullableListFilter<"ContentItem">
    teamSlugs?: StringNullableListFilter<"ContentItem">
    topics?: StringNullableListFilter<"ContentItem">
    importanceScore?: FloatNullableWithAggregatesFilter<"ContentItem"> | number | null
    noveltyScore?: FloatNullableWithAggregatesFilter<"ContentItem"> | number | null
    fetchedAt?: DateTimeWithAggregatesFilter<"ContentItem"> | Date | string
    sourceId?: StringNullableWithAggregatesFilter<"ContentItem"> | string | null
  }

  export type ContentSourceWhereInput = {
    AND?: ContentSourceWhereInput | ContentSourceWhereInput[]
    OR?: ContentSourceWhereInput[]
    NOT?: ContentSourceWhereInput | ContentSourceWhereInput[]
    id?: StringFilter<"ContentSource"> | string
    name?: StringFilter<"ContentSource"> | string
    type?: StringFilter<"ContentSource"> | string
    url?: StringFilter<"ContentSource"> | string
    refreshIntervalMins?: IntFilter<"ContentSource"> | number
    lastFetchedAt?: DateTimeNullableFilter<"ContentSource"> | Date | string | null
    isActive?: BoolFilter<"ContentSource"> | boolean
    items?: ContentItemListRelationFilter
  }

  export type ContentSourceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    url?: SortOrder
    refreshIntervalMins?: SortOrder
    lastFetchedAt?: SortOrderInput | SortOrder
    isActive?: SortOrder
    items?: ContentItemOrderByRelationAggregateInput
  }

  export type ContentSourceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ContentSourceWhereInput | ContentSourceWhereInput[]
    OR?: ContentSourceWhereInput[]
    NOT?: ContentSourceWhereInput | ContentSourceWhereInput[]
    name?: StringFilter<"ContentSource"> | string
    type?: StringFilter<"ContentSource"> | string
    url?: StringFilter<"ContentSource"> | string
    refreshIntervalMins?: IntFilter<"ContentSource"> | number
    lastFetchedAt?: DateTimeNullableFilter<"ContentSource"> | Date | string | null
    isActive?: BoolFilter<"ContentSource"> | boolean
    items?: ContentItemListRelationFilter
  }, "id">

  export type ContentSourceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    url?: SortOrder
    refreshIntervalMins?: SortOrder
    lastFetchedAt?: SortOrderInput | SortOrder
    isActive?: SortOrder
    _count?: ContentSourceCountOrderByAggregateInput
    _avg?: ContentSourceAvgOrderByAggregateInput
    _max?: ContentSourceMaxOrderByAggregateInput
    _min?: ContentSourceMinOrderByAggregateInput
    _sum?: ContentSourceSumOrderByAggregateInput
  }

  export type ContentSourceScalarWhereWithAggregatesInput = {
    AND?: ContentSourceScalarWhereWithAggregatesInput | ContentSourceScalarWhereWithAggregatesInput[]
    OR?: ContentSourceScalarWhereWithAggregatesInput[]
    NOT?: ContentSourceScalarWhereWithAggregatesInput | ContentSourceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ContentSource"> | string
    name?: StringWithAggregatesFilter<"ContentSource"> | string
    type?: StringWithAggregatesFilter<"ContentSource"> | string
    url?: StringWithAggregatesFilter<"ContentSource"> | string
    refreshIntervalMins?: IntWithAggregatesFilter<"ContentSource"> | number
    lastFetchedAt?: DateTimeNullableWithAggregatesFilter<"ContentSource"> | Date | string | null
    isActive?: BoolWithAggregatesFilter<"ContentSource"> | boolean
  }

  export type UserCreateInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileUncheckedCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesUncheckedCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetUncheckedCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUncheckedUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUncheckedUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUncheckedUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SleeperProfileCreateInput = {
    id?: string
    sleeperId: string
    displayName: string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSleeperProfileInput
  }

  export type SleeperProfileUncheckedCreateInput = {
    id?: string
    userId: string
    sleeperId: string
    displayName: string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type SleeperProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sleeperId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSleeperProfileNestedInput
  }

  export type SleeperProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    sleeperId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SleeperProfileCreateManyInput = {
    id?: string
    userId: string
    sleeperId: string
    displayName: string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type SleeperProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sleeperId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SleeperProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    sleeperId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesCreateInput = {
    id?: string
    leagueStyle?: $Enums.LeagueStyle
    scoringPriority?: $Enums.ScoringPriority
    playStyle?: $Enums.PlayStyle
    reportFormat?: $Enums.ReportFormat
    priorityPositions?: UserPreferencesCreatepriorityPositionsInput | string[]
    customInstructions?: string | null
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPreferencesInput
  }

  export type UserPreferencesUncheckedCreateInput = {
    id?: string
    userId: string
    leagueStyle?: $Enums.LeagueStyle
    scoringPriority?: $Enums.ScoringPriority
    playStyle?: $Enums.PlayStyle
    reportFormat?: $Enums.ReportFormat
    priorityPositions?: UserPreferencesCreatepriorityPositionsInput | string[]
    customInstructions?: string | null
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: Date | string
  }

  export type UserPreferencesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueStyle?: EnumLeagueStyleFieldUpdateOperationsInput | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFieldUpdateOperationsInput | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFieldUpdateOperationsInput | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFieldUpdateOperationsInput | $Enums.ReportFormat
    priorityPositions?: UserPreferencesUpdatepriorityPositionsInput | string[]
    customInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    notifyOnInjury?: BoolFieldUpdateOperationsInput | boolean
    notifyOnTrending?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPreferencesNestedInput
  }

  export type UserPreferencesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    leagueStyle?: EnumLeagueStyleFieldUpdateOperationsInput | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFieldUpdateOperationsInput | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFieldUpdateOperationsInput | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFieldUpdateOperationsInput | $Enums.ReportFormat
    priorityPositions?: UserPreferencesUpdatepriorityPositionsInput | string[]
    customInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    notifyOnInjury?: BoolFieldUpdateOperationsInput | boolean
    notifyOnTrending?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesCreateManyInput = {
    id?: string
    userId: string
    leagueStyle?: $Enums.LeagueStyle
    scoringPriority?: $Enums.ScoringPriority
    playStyle?: $Enums.PlayStyle
    reportFormat?: $Enums.ReportFormat
    priorityPositions?: UserPreferencesCreatepriorityPositionsInput | string[]
    customInstructions?: string | null
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: Date | string
  }

  export type UserPreferencesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueStyle?: EnumLeagueStyleFieldUpdateOperationsInput | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFieldUpdateOperationsInput | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFieldUpdateOperationsInput | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFieldUpdateOperationsInput | $Enums.ReportFormat
    priorityPositions?: UserPreferencesUpdatepriorityPositionsInput | string[]
    customInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    notifyOnInjury?: BoolFieldUpdateOperationsInput | boolean
    notifyOnTrending?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    leagueStyle?: EnumLeagueStyleFieldUpdateOperationsInput | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFieldUpdateOperationsInput | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFieldUpdateOperationsInput | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFieldUpdateOperationsInput | $Enums.ReportFormat
    priorityPositions?: UserPreferencesUpdatepriorityPositionsInput | string[]
    customInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    notifyOnInjury?: BoolFieldUpdateOperationsInput | boolean
    notifyOnTrending?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateInput = {
    id?: string
    agentType: string
    status?: $Enums.AgentRunStatus
    inputJson: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: number | null
    durationMs?: number | null
    rating?: $Enums.AgentResultRating | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAgentRunsInput
  }

  export type AgentRunUncheckedCreateInput = {
    id?: string
    userId: string
    agentType: string
    status?: $Enums.AgentRunStatus
    inputJson: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: number | null
    durationMs?: number | null
    rating?: $Enums.AgentResultRating | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAgentRunsNestedInput
  }

  export type AgentRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateManyInput = {
    id?: string
    userId: string
    agentType: string
    status?: $Enums.AgentRunStatus
    inputJson: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: number | null
    durationMs?: number | null
    rating?: $Enums.AgentResultRating | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenBudgetCreateInput = {
    id?: string
    periodStart: Date | string
    tokensUsed?: number
    runsUsed?: number
    user: UserCreateNestedOneWithoutTokenBudgetInput
  }

  export type TokenBudgetUncheckedCreateInput = {
    id?: string
    userId: string
    periodStart: Date | string
    tokensUsed?: number
    runsUsed?: number
  }

  export type TokenBudgetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutTokenBudgetNestedInput
  }

  export type TokenBudgetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TokenBudgetCreateManyInput = {
    id?: string
    userId: string
    periodStart: Date | string
    tokensUsed?: number
    runsUsed?: number
  }

  export type TokenBudgetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TokenBudgetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
  }

  export type AnalyticsEventCreateInput = {
    id?: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    user?: UserCreateNestedOneWithoutAnalyticsEventsInput
  }

  export type AnalyticsEventUncheckedCreateInput = {
    id?: string
    userId?: string | null
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AnalyticsEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutAnalyticsEventsNestedInput
  }

  export type AnalyticsEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventCreateManyInput = {
    id?: string
    userId?: string | null
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AnalyticsEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerCreateInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
    rankings?: PlayerRankingCreateNestedManyWithoutPlayerInput
    trending?: TrendingPlayerCreateNestedManyWithoutPlayerInput
  }

  export type PlayerUncheckedCreateInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
    rankings?: PlayerRankingUncheckedCreateNestedManyWithoutPlayerInput
    trending?: TrendingPlayerUncheckedCreateNestedManyWithoutPlayerInput
  }

  export type PlayerUpdateInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rankings?: PlayerRankingUpdateManyWithoutPlayerNestedInput
    trending?: TrendingPlayerUpdateManyWithoutPlayerNestedInput
  }

  export type PlayerUncheckedUpdateInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rankings?: PlayerRankingUncheckedUpdateManyWithoutPlayerNestedInput
    trending?: TrendingPlayerUncheckedUpdateManyWithoutPlayerNestedInput
  }

  export type PlayerCreateManyInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
  }

  export type PlayerUpdateManyMutationInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerUncheckedUpdateManyInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerRankingCreateInput = {
    id?: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt?: Date | string
    player: PlayerCreateNestedOneWithoutRankingsInput
  }

  export type PlayerRankingUncheckedCreateInput = {
    id?: string
    playerId: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt?: Date | string
  }

  export type PlayerRankingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    player?: PlayerUpdateOneRequiredWithoutRankingsNestedInput
  }

  export type PlayerRankingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerRankingCreateManyInput = {
    id?: string
    playerId: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt?: Date | string
  }

  export type PlayerRankingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerRankingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrendingPlayerCreateInput = {
    id?: string
    type: $Enums.TrendingType
    count: number
    lookbackHours?: number
    fetchedAt?: Date | string
    player: PlayerCreateNestedOneWithoutTrendingInput
  }

  export type TrendingPlayerUncheckedCreateInput = {
    id?: string
    playerId: string
    type: $Enums.TrendingType
    count: number
    lookbackHours?: number
    fetchedAt?: Date | string
  }

  export type TrendingPlayerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    player?: PlayerUpdateOneRequiredWithoutTrendingNestedInput
  }

  export type TrendingPlayerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrendingPlayerCreateManyInput = {
    id?: string
    playerId: string
    type: $Enums.TrendingType
    count: number
    lookbackHours?: number
    fetchedAt?: Date | string
  }

  export type TrendingPlayerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrendingPlayerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContentItemCreateInput = {
    id?: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt?: Date | string | null
    authorName?: string | null
    rawContent: string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemCreateplayerIdsInput | string[]
    teamSlugs?: ContentItemCreateteamSlugsInput | string[]
    topics?: ContentItemCreatetopicsInput | string[]
    importanceScore?: number | null
    noveltyScore?: number | null
    fetchedAt?: Date | string
    source?: ContentSourceCreateNestedOneWithoutItemsInput
  }

  export type ContentItemUncheckedCreateInput = {
    id?: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt?: Date | string | null
    authorName?: string | null
    rawContent: string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemCreateplayerIdsInput | string[]
    teamSlugs?: ContentItemCreateteamSlugsInput | string[]
    topics?: ContentItemCreatetopicsInput | string[]
    importanceScore?: number | null
    noveltyScore?: number | null
    fetchedAt?: Date | string
    sourceId?: string | null
  }

  export type ContentItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    source?: ContentSourceUpdateOneWithoutItemsNestedInput
  }

  export type ContentItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ContentItemCreateManyInput = {
    id?: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt?: Date | string | null
    authorName?: string | null
    rawContent: string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemCreateplayerIdsInput | string[]
    teamSlugs?: ContentItemCreateteamSlugsInput | string[]
    topics?: ContentItemCreatetopicsInput | string[]
    importanceScore?: number | null
    noveltyScore?: number | null
    fetchedAt?: Date | string
    sourceId?: string | null
  }

  export type ContentItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContentItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ContentSourceCreateInput = {
    id?: string
    name: string
    type: string
    url: string
    refreshIntervalMins?: number
    lastFetchedAt?: Date | string | null
    isActive?: boolean
    items?: ContentItemCreateNestedManyWithoutSourceInput
  }

  export type ContentSourceUncheckedCreateInput = {
    id?: string
    name: string
    type: string
    url: string
    refreshIntervalMins?: number
    lastFetchedAt?: Date | string | null
    isActive?: boolean
    items?: ContentItemUncheckedCreateNestedManyWithoutSourceInput
  }

  export type ContentSourceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    refreshIntervalMins?: IntFieldUpdateOperationsInput | number
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    items?: ContentItemUpdateManyWithoutSourceNestedInput
  }

  export type ContentSourceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    refreshIntervalMins?: IntFieldUpdateOperationsInput | number
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    items?: ContentItemUncheckedUpdateManyWithoutSourceNestedInput
  }

  export type ContentSourceCreateManyInput = {
    id?: string
    name: string
    type: string
    url: string
    refreshIntervalMins?: number
    lastFetchedAt?: Date | string | null
    isActive?: boolean
  }

  export type ContentSourceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    refreshIntervalMins?: IntFieldUpdateOperationsInput | number
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContentSourceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    refreshIntervalMins?: IntFieldUpdateOperationsInput | number
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumUserTierFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierFilter<$PrismaModel> | $Enums.UserTier
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SleeperProfileNullableScalarRelationFilter = {
    is?: SleeperProfileWhereInput | null
    isNot?: SleeperProfileWhereInput | null
  }

  export type UserPreferencesNullableScalarRelationFilter = {
    is?: UserPreferencesWhereInput | null
    isNot?: UserPreferencesWhereInput | null
  }

  export type AgentRunListRelationFilter = {
    every?: AgentRunWhereInput
    some?: AgentRunWhereInput
    none?: AgentRunWhereInput
  }

  export type TokenBudgetListRelationFilter = {
    every?: TokenBudgetWhereInput
    some?: TokenBudgetWhereInput
    none?: TokenBudgetWhereInput
  }

  export type AnalyticsEventListRelationFilter = {
    every?: AnalyticsEventWhereInput
    some?: AnalyticsEventWhereInput
    none?: AnalyticsEventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AgentRunOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TokenBudgetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnalyticsEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    runCredits?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    stripeSubscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    runCredits?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    runCredits?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    stripeSubscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    clerkId?: SortOrder
    email?: SortOrder
    tier?: SortOrder
    role?: SortOrder
    runCredits?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    stripeSubscriptionStatus?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    runCredits?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumUserTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierWithAggregatesFilter<$PrismaModel> | $Enums.UserTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTierFilter<$PrismaModel>
    _max?: NestedEnumUserTierFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SleeperProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    sleeperId?: SortOrder
    displayName?: SortOrder
    leagues?: SortOrder
    updatedAt?: SortOrder
  }

  export type SleeperProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    sleeperId?: SortOrder
    displayName?: SortOrder
    updatedAt?: SortOrder
  }

  export type SleeperProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    sleeperId?: SortOrder
    displayName?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumLeagueStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStyle | EnumLeagueStyleFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStyleFilter<$PrismaModel> | $Enums.LeagueStyle
  }

  export type EnumScoringPriorityFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringPriority | EnumScoringPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumScoringPriorityFilter<$PrismaModel> | $Enums.ScoringPriority
  }

  export type EnumPlayStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.PlayStyle | EnumPlayStyleFieldRefInput<$PrismaModel>
    in?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumPlayStyleFilter<$PrismaModel> | $Enums.PlayStyle
  }

  export type EnumReportFormatFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportFormat | EnumReportFormatFieldRefInput<$PrismaModel>
    in?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    not?: NestedEnumReportFormatFilter<$PrismaModel> | $Enums.ReportFormat
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserPreferencesCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    leagueStyle?: SortOrder
    scoringPriority?: SortOrder
    playStyle?: SortOrder
    reportFormat?: SortOrder
    priorityPositions?: SortOrder
    customInstructions?: SortOrder
    notifyOnInjury?: SortOrder
    notifyOnTrending?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserPreferencesMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    leagueStyle?: SortOrder
    scoringPriority?: SortOrder
    playStyle?: SortOrder
    reportFormat?: SortOrder
    customInstructions?: SortOrder
    notifyOnInjury?: SortOrder
    notifyOnTrending?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserPreferencesMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    leagueStyle?: SortOrder
    scoringPriority?: SortOrder
    playStyle?: SortOrder
    reportFormat?: SortOrder
    customInstructions?: SortOrder
    notifyOnInjury?: SortOrder
    notifyOnTrending?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumLeagueStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStyle | EnumLeagueStyleFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStyleWithAggregatesFilter<$PrismaModel> | $Enums.LeagueStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeagueStyleFilter<$PrismaModel>
    _max?: NestedEnumLeagueStyleFilter<$PrismaModel>
  }

  export type EnumScoringPriorityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringPriority | EnumScoringPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumScoringPriorityWithAggregatesFilter<$PrismaModel> | $Enums.ScoringPriority
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumScoringPriorityFilter<$PrismaModel>
    _max?: NestedEnumScoringPriorityFilter<$PrismaModel>
  }

  export type EnumPlayStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlayStyle | EnumPlayStyleFieldRefInput<$PrismaModel>
    in?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumPlayStyleWithAggregatesFilter<$PrismaModel> | $Enums.PlayStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlayStyleFilter<$PrismaModel>
    _max?: NestedEnumPlayStyleFilter<$PrismaModel>
  }

  export type EnumReportFormatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportFormat | EnumReportFormatFieldRefInput<$PrismaModel>
    in?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    not?: NestedEnumReportFormatWithAggregatesFilter<$PrismaModel> | $Enums.ReportFormat
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReportFormatFilter<$PrismaModel>
    _max?: NestedEnumReportFormatFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumAgentRunStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusFilter<$PrismaModel> | $Enums.AgentRunStatus
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumAgentResultRatingNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentResultRating | EnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    in?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAgentResultRatingNullableFilter<$PrismaModel> | $Enums.AgentResultRating | null
  }

  export type AgentRunCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputJson?: SortOrder
    outputJson?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
    rating?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunAvgOrderByAggregateInput = {
    tokensUsed?: SortOrder
    durationMs?: SortOrder
  }

  export type AgentRunMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
    rating?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
    rating?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentRunSumOrderByAggregateInput = {
    tokensUsed?: SortOrder
    durationMs?: SortOrder
  }

  export type EnumAgentRunStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusWithAggregatesFilter<$PrismaModel> | $Enums.AgentRunStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAgentRunStatusFilter<$PrismaModel>
    _max?: NestedEnumAgentRunStatusFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumAgentResultRatingNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentResultRating | EnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    in?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAgentResultRatingNullableWithAggregatesFilter<$PrismaModel> | $Enums.AgentResultRating | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumAgentResultRatingNullableFilter<$PrismaModel>
    _max?: NestedEnumAgentResultRatingNullableFilter<$PrismaModel>
  }

  export type TokenBudgetUserIdPeriodStartCompoundUniqueInput = {
    userId: string
    periodStart: Date | string
  }

  export type TokenBudgetCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    periodStart?: SortOrder
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
  }

  export type TokenBudgetAvgOrderByAggregateInput = {
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
  }

  export type TokenBudgetMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    periodStart?: SortOrder
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
  }

  export type TokenBudgetMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    periodStart?: SortOrder
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
  }

  export type TokenBudgetSumOrderByAggregateInput = {
    tokensUsed?: SortOrder
    runsUsed?: SortOrder
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type AnalyticsEventCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
  }

  export type AnalyticsEventMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
  }

  export type AnalyticsEventMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    eventType?: SortOrder
    createdAt?: SortOrder
  }

  export type PlayerRankingListRelationFilter = {
    every?: PlayerRankingWhereInput
    some?: PlayerRankingWhereInput
    none?: PlayerRankingWhereInput
  }

  export type TrendingPlayerListRelationFilter = {
    every?: TrendingPlayerWhereInput
    some?: TrendingPlayerWhereInput
    none?: TrendingPlayerWhereInput
  }

  export type PlayerRankingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrendingPlayerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PlayerCountOrderByAggregateInput = {
    sleeperId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    position?: SortOrder
    team?: SortOrder
    status?: SortOrder
    injuryStatus?: SortOrder
    practiceParticipation?: SortOrder
    depthChartPosition?: SortOrder
    depthChartOrder?: SortOrder
    searchRank?: SortOrder
    age?: SortOrder
    yearsExp?: SortOrder
    metadata?: SortOrder
    lastRefreshedAt?: SortOrder
  }

  export type PlayerAvgOrderByAggregateInput = {
    depthChartOrder?: SortOrder
    searchRank?: SortOrder
    age?: SortOrder
    yearsExp?: SortOrder
  }

  export type PlayerMaxOrderByAggregateInput = {
    sleeperId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    position?: SortOrder
    team?: SortOrder
    status?: SortOrder
    injuryStatus?: SortOrder
    practiceParticipation?: SortOrder
    depthChartPosition?: SortOrder
    depthChartOrder?: SortOrder
    searchRank?: SortOrder
    age?: SortOrder
    yearsExp?: SortOrder
    lastRefreshedAt?: SortOrder
  }

  export type PlayerMinOrderByAggregateInput = {
    sleeperId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    position?: SortOrder
    team?: SortOrder
    status?: SortOrder
    injuryStatus?: SortOrder
    practiceParticipation?: SortOrder
    depthChartPosition?: SortOrder
    depthChartOrder?: SortOrder
    searchRank?: SortOrder
    age?: SortOrder
    yearsExp?: SortOrder
    lastRefreshedAt?: SortOrder
  }

  export type PlayerSumOrderByAggregateInput = {
    depthChartOrder?: SortOrder
    searchRank?: SortOrder
    age?: SortOrder
    yearsExp?: SortOrder
  }

  export type PlayerScalarRelationFilter = {
    is?: PlayerWhereInput
    isNot?: PlayerWhereInput
  }

  export type PlayerRankingPlayerIdSourceWeekSeasonCompoundUniqueInput = {
    playerId: string
    source: string
    week: number
    season: number
  }

  export type PlayerRankingCountOrderByAggregateInput = {
    id?: SortOrder
    playerId?: SortOrder
    source?: SortOrder
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
    fetchedAt?: SortOrder
  }

  export type PlayerRankingAvgOrderByAggregateInput = {
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
  }

  export type PlayerRankingMaxOrderByAggregateInput = {
    id?: SortOrder
    playerId?: SortOrder
    source?: SortOrder
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
    fetchedAt?: SortOrder
  }

  export type PlayerRankingMinOrderByAggregateInput = {
    id?: SortOrder
    playerId?: SortOrder
    source?: SortOrder
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
    fetchedAt?: SortOrder
  }

  export type PlayerRankingSumOrderByAggregateInput = {
    rankOverall?: SortOrder
    rankPosition?: SortOrder
    week?: SortOrder
    season?: SortOrder
  }

  export type EnumTrendingTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TrendingType | EnumTrendingTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTrendingTypeFilter<$PrismaModel> | $Enums.TrendingType
  }

  export type TrendingPlayerCountOrderByAggregateInput = {
    id?: SortOrder
    playerId?: SortOrder
    type?: SortOrder
    count?: SortOrder
    lookbackHours?: SortOrder
    fetchedAt?: SortOrder
  }

  export type TrendingPlayerAvgOrderByAggregateInput = {
    count?: SortOrder
    lookbackHours?: SortOrder
  }

  export type TrendingPlayerMaxOrderByAggregateInput = {
    id?: SortOrder
    playerId?: SortOrder
    type?: SortOrder
    count?: SortOrder
    lookbackHours?: SortOrder
    fetchedAt?: SortOrder
  }

  export type TrendingPlayerMinOrderByAggregateInput = {
    id?: SortOrder
    playerId?: SortOrder
    type?: SortOrder
    count?: SortOrder
    lookbackHours?: SortOrder
    fetchedAt?: SortOrder
  }

  export type TrendingPlayerSumOrderByAggregateInput = {
    count?: SortOrder
    lookbackHours?: SortOrder
  }

  export type EnumTrendingTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrendingType | EnumTrendingTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTrendingTypeWithAggregatesFilter<$PrismaModel> | $Enums.TrendingType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrendingTypeFilter<$PrismaModel>
    _max?: NestedEnumTrendingTypeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type ContentSourceNullableScalarRelationFilter = {
    is?: ContentSourceWhereInput | null
    isNot?: ContentSourceWhereInput | null
  }

  export type ContentItemCountOrderByAggregateInput = {
    id?: SortOrder
    sourceType?: SortOrder
    sourceUrl?: SortOrder
    title?: SortOrder
    publishedAt?: SortOrder
    authorName?: SortOrder
    rawContent?: SortOrder
    extractedFacts?: SortOrder
    playerIds?: SortOrder
    teamSlugs?: SortOrder
    topics?: SortOrder
    importanceScore?: SortOrder
    noveltyScore?: SortOrder
    fetchedAt?: SortOrder
    sourceId?: SortOrder
  }

  export type ContentItemAvgOrderByAggregateInput = {
    importanceScore?: SortOrder
    noveltyScore?: SortOrder
  }

  export type ContentItemMaxOrderByAggregateInput = {
    id?: SortOrder
    sourceType?: SortOrder
    sourceUrl?: SortOrder
    title?: SortOrder
    publishedAt?: SortOrder
    authorName?: SortOrder
    rawContent?: SortOrder
    importanceScore?: SortOrder
    noveltyScore?: SortOrder
    fetchedAt?: SortOrder
    sourceId?: SortOrder
  }

  export type ContentItemMinOrderByAggregateInput = {
    id?: SortOrder
    sourceType?: SortOrder
    sourceUrl?: SortOrder
    title?: SortOrder
    publishedAt?: SortOrder
    authorName?: SortOrder
    rawContent?: SortOrder
    importanceScore?: SortOrder
    noveltyScore?: SortOrder
    fetchedAt?: SortOrder
    sourceId?: SortOrder
  }

  export type ContentItemSumOrderByAggregateInput = {
    importanceScore?: SortOrder
    noveltyScore?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type ContentItemListRelationFilter = {
    every?: ContentItemWhereInput
    some?: ContentItemWhereInput
    none?: ContentItemWhereInput
  }

  export type ContentItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ContentSourceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    url?: SortOrder
    refreshIntervalMins?: SortOrder
    lastFetchedAt?: SortOrder
    isActive?: SortOrder
  }

  export type ContentSourceAvgOrderByAggregateInput = {
    refreshIntervalMins?: SortOrder
  }

  export type ContentSourceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    url?: SortOrder
    refreshIntervalMins?: SortOrder
    lastFetchedAt?: SortOrder
    isActive?: SortOrder
  }

  export type ContentSourceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    url?: SortOrder
    refreshIntervalMins?: SortOrder
    lastFetchedAt?: SortOrder
    isActive?: SortOrder
  }

  export type ContentSourceSumOrderByAggregateInput = {
    refreshIntervalMins?: SortOrder
  }

  export type SleeperProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<SleeperProfileCreateWithoutUserInput, SleeperProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: SleeperProfileCreateOrConnectWithoutUserInput
    connect?: SleeperProfileWhereUniqueInput
  }

  export type UserPreferencesCreateNestedOneWithoutUserInput = {
    create?: XOR<UserPreferencesCreateWithoutUserInput, UserPreferencesUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserPreferencesCreateOrConnectWithoutUserInput
    connect?: UserPreferencesWhereUniqueInput
  }

  export type AgentRunCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
  }

  export type TokenBudgetCreateNestedManyWithoutUserInput = {
    create?: XOR<TokenBudgetCreateWithoutUserInput, TokenBudgetUncheckedCreateWithoutUserInput> | TokenBudgetCreateWithoutUserInput[] | TokenBudgetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TokenBudgetCreateOrConnectWithoutUserInput | TokenBudgetCreateOrConnectWithoutUserInput[]
    createMany?: TokenBudgetCreateManyUserInputEnvelope
    connect?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
  }

  export type AnalyticsEventCreateNestedManyWithoutUserInput = {
    create?: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput> | AnalyticsEventCreateWithoutUserInput[] | AnalyticsEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[]
    createMany?: AnalyticsEventCreateManyUserInputEnvelope
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
  }

  export type SleeperProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<SleeperProfileCreateWithoutUserInput, SleeperProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: SleeperProfileCreateOrConnectWithoutUserInput
    connect?: SleeperProfileWhereUniqueInput
  }

  export type UserPreferencesUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserPreferencesCreateWithoutUserInput, UserPreferencesUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserPreferencesCreateOrConnectWithoutUserInput
    connect?: UserPreferencesWhereUniqueInput
  }

  export type AgentRunUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
  }

  export type TokenBudgetUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<TokenBudgetCreateWithoutUserInput, TokenBudgetUncheckedCreateWithoutUserInput> | TokenBudgetCreateWithoutUserInput[] | TokenBudgetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TokenBudgetCreateOrConnectWithoutUserInput | TokenBudgetCreateOrConnectWithoutUserInput[]
    createMany?: TokenBudgetCreateManyUserInputEnvelope
    connect?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
  }

  export type AnalyticsEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput> | AnalyticsEventCreateWithoutUserInput[] | AnalyticsEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[]
    createMany?: AnalyticsEventCreateManyUserInputEnvelope
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserTierFieldUpdateOperationsInput = {
    set?: $Enums.UserTier
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SleeperProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<SleeperProfileCreateWithoutUserInput, SleeperProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: SleeperProfileCreateOrConnectWithoutUserInput
    upsert?: SleeperProfileUpsertWithoutUserInput
    disconnect?: SleeperProfileWhereInput | boolean
    delete?: SleeperProfileWhereInput | boolean
    connect?: SleeperProfileWhereUniqueInput
    update?: XOR<XOR<SleeperProfileUpdateToOneWithWhereWithoutUserInput, SleeperProfileUpdateWithoutUserInput>, SleeperProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserPreferencesUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserPreferencesCreateWithoutUserInput, UserPreferencesUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserPreferencesCreateOrConnectWithoutUserInput
    upsert?: UserPreferencesUpsertWithoutUserInput
    disconnect?: UserPreferencesWhereInput | boolean
    delete?: UserPreferencesWhereInput | boolean
    connect?: UserPreferencesWhereUniqueInput
    update?: XOR<XOR<UserPreferencesUpdateToOneWithWhereWithoutUserInput, UserPreferencesUpdateWithoutUserInput>, UserPreferencesUncheckedUpdateWithoutUserInput>
  }

  export type AgentRunUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    upsert?: AgentRunUpsertWithWhereUniqueWithoutUserInput | AgentRunUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    set?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    disconnect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    delete?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    update?: AgentRunUpdateWithWhereUniqueWithoutUserInput | AgentRunUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentRunUpdateManyWithWhereWithoutUserInput | AgentRunUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
  }

  export type TokenBudgetUpdateManyWithoutUserNestedInput = {
    create?: XOR<TokenBudgetCreateWithoutUserInput, TokenBudgetUncheckedCreateWithoutUserInput> | TokenBudgetCreateWithoutUserInput[] | TokenBudgetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TokenBudgetCreateOrConnectWithoutUserInput | TokenBudgetCreateOrConnectWithoutUserInput[]
    upsert?: TokenBudgetUpsertWithWhereUniqueWithoutUserInput | TokenBudgetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TokenBudgetCreateManyUserInputEnvelope
    set?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    disconnect?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    delete?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    connect?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    update?: TokenBudgetUpdateWithWhereUniqueWithoutUserInput | TokenBudgetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TokenBudgetUpdateManyWithWhereWithoutUserInput | TokenBudgetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TokenBudgetScalarWhereInput | TokenBudgetScalarWhereInput[]
  }

  export type AnalyticsEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput> | AnalyticsEventCreateWithoutUserInput[] | AnalyticsEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[]
    upsert?: AnalyticsEventUpsertWithWhereUniqueWithoutUserInput | AnalyticsEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AnalyticsEventCreateManyUserInputEnvelope
    set?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    disconnect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    delete?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    update?: AnalyticsEventUpdateWithWhereUniqueWithoutUserInput | AnalyticsEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AnalyticsEventUpdateManyWithWhereWithoutUserInput | AnalyticsEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[]
  }

  export type SleeperProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<SleeperProfileCreateWithoutUserInput, SleeperProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: SleeperProfileCreateOrConnectWithoutUserInput
    upsert?: SleeperProfileUpsertWithoutUserInput
    disconnect?: SleeperProfileWhereInput | boolean
    delete?: SleeperProfileWhereInput | boolean
    connect?: SleeperProfileWhereUniqueInput
    update?: XOR<XOR<SleeperProfileUpdateToOneWithWhereWithoutUserInput, SleeperProfileUpdateWithoutUserInput>, SleeperProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserPreferencesUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserPreferencesCreateWithoutUserInput, UserPreferencesUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserPreferencesCreateOrConnectWithoutUserInput
    upsert?: UserPreferencesUpsertWithoutUserInput
    disconnect?: UserPreferencesWhereInput | boolean
    delete?: UserPreferencesWhereInput | boolean
    connect?: UserPreferencesWhereUniqueInput
    update?: XOR<XOR<UserPreferencesUpdateToOneWithWhereWithoutUserInput, UserPreferencesUpdateWithoutUserInput>, UserPreferencesUncheckedUpdateWithoutUserInput>
  }

  export type AgentRunUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput> | AgentRunCreateWithoutUserInput[] | AgentRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentRunCreateOrConnectWithoutUserInput | AgentRunCreateOrConnectWithoutUserInput[]
    upsert?: AgentRunUpsertWithWhereUniqueWithoutUserInput | AgentRunUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentRunCreateManyUserInputEnvelope
    set?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    disconnect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    delete?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    connect?: AgentRunWhereUniqueInput | AgentRunWhereUniqueInput[]
    update?: AgentRunUpdateWithWhereUniqueWithoutUserInput | AgentRunUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentRunUpdateManyWithWhereWithoutUserInput | AgentRunUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
  }

  export type TokenBudgetUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<TokenBudgetCreateWithoutUserInput, TokenBudgetUncheckedCreateWithoutUserInput> | TokenBudgetCreateWithoutUserInput[] | TokenBudgetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TokenBudgetCreateOrConnectWithoutUserInput | TokenBudgetCreateOrConnectWithoutUserInput[]
    upsert?: TokenBudgetUpsertWithWhereUniqueWithoutUserInput | TokenBudgetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TokenBudgetCreateManyUserInputEnvelope
    set?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    disconnect?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    delete?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    connect?: TokenBudgetWhereUniqueInput | TokenBudgetWhereUniqueInput[]
    update?: TokenBudgetUpdateWithWhereUniqueWithoutUserInput | TokenBudgetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TokenBudgetUpdateManyWithWhereWithoutUserInput | TokenBudgetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TokenBudgetScalarWhereInput | TokenBudgetScalarWhereInput[]
  }

  export type AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput> | AnalyticsEventCreateWithoutUserInput[] | AnalyticsEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AnalyticsEventCreateOrConnectWithoutUserInput | AnalyticsEventCreateOrConnectWithoutUserInput[]
    upsert?: AnalyticsEventUpsertWithWhereUniqueWithoutUserInput | AnalyticsEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AnalyticsEventCreateManyUserInputEnvelope
    set?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    disconnect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    delete?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    connect?: AnalyticsEventWhereUniqueInput | AnalyticsEventWhereUniqueInput[]
    update?: AnalyticsEventUpdateWithWhereUniqueWithoutUserInput | AnalyticsEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AnalyticsEventUpdateManyWithWhereWithoutUserInput | AnalyticsEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSleeperProfileInput = {
    create?: XOR<UserCreateWithoutSleeperProfileInput, UserUncheckedCreateWithoutSleeperProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutSleeperProfileInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSleeperProfileNestedInput = {
    create?: XOR<UserCreateWithoutSleeperProfileInput, UserUncheckedCreateWithoutSleeperProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutSleeperProfileInput
    upsert?: UserUpsertWithoutSleeperProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSleeperProfileInput, UserUpdateWithoutSleeperProfileInput>, UserUncheckedUpdateWithoutSleeperProfileInput>
  }

  export type UserPreferencesCreatepriorityPositionsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutPreferencesInput = {
    create?: XOR<UserCreateWithoutPreferencesInput, UserUncheckedCreateWithoutPreferencesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPreferencesInput
    connect?: UserWhereUniqueInput
  }

  export type EnumLeagueStyleFieldUpdateOperationsInput = {
    set?: $Enums.LeagueStyle
  }

  export type EnumScoringPriorityFieldUpdateOperationsInput = {
    set?: $Enums.ScoringPriority
  }

  export type EnumPlayStyleFieldUpdateOperationsInput = {
    set?: $Enums.PlayStyle
  }

  export type EnumReportFormatFieldUpdateOperationsInput = {
    set?: $Enums.ReportFormat
  }

  export type UserPreferencesUpdatepriorityPositionsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutPreferencesNestedInput = {
    create?: XOR<UserCreateWithoutPreferencesInput, UserUncheckedCreateWithoutPreferencesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPreferencesInput
    upsert?: UserUpsertWithoutPreferencesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPreferencesInput, UserUpdateWithoutPreferencesInput>, UserUncheckedUpdateWithoutPreferencesInput>
  }

  export type UserCreateNestedOneWithoutAgentRunsInput = {
    create?: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAgentRunsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumAgentRunStatusFieldUpdateOperationsInput = {
    set?: $Enums.AgentRunStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumAgentResultRatingFieldUpdateOperationsInput = {
    set?: $Enums.AgentResultRating | null
  }

  export type UserUpdateOneRequiredWithoutAgentRunsNestedInput = {
    create?: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAgentRunsInput
    upsert?: UserUpsertWithoutAgentRunsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAgentRunsInput, UserUpdateWithoutAgentRunsInput>, UserUncheckedUpdateWithoutAgentRunsInput>
  }

  export type UserCreateNestedOneWithoutTokenBudgetInput = {
    create?: XOR<UserCreateWithoutTokenBudgetInput, UserUncheckedCreateWithoutTokenBudgetInput>
    connectOrCreate?: UserCreateOrConnectWithoutTokenBudgetInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTokenBudgetNestedInput = {
    create?: XOR<UserCreateWithoutTokenBudgetInput, UserUncheckedCreateWithoutTokenBudgetInput>
    connectOrCreate?: UserCreateOrConnectWithoutTokenBudgetInput
    upsert?: UserUpsertWithoutTokenBudgetInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTokenBudgetInput, UserUpdateWithoutTokenBudgetInput>, UserUncheckedUpdateWithoutTokenBudgetInput>
  }

  export type UserCreateNestedOneWithoutAnalyticsEventsInput = {
    create?: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAnalyticsEventsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutAnalyticsEventsNestedInput = {
    create?: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAnalyticsEventsInput
    upsert?: UserUpsertWithoutAnalyticsEventsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAnalyticsEventsInput, UserUpdateWithoutAnalyticsEventsInput>, UserUncheckedUpdateWithoutAnalyticsEventsInput>
  }

  export type PlayerRankingCreateNestedManyWithoutPlayerInput = {
    create?: XOR<PlayerRankingCreateWithoutPlayerInput, PlayerRankingUncheckedCreateWithoutPlayerInput> | PlayerRankingCreateWithoutPlayerInput[] | PlayerRankingUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: PlayerRankingCreateOrConnectWithoutPlayerInput | PlayerRankingCreateOrConnectWithoutPlayerInput[]
    createMany?: PlayerRankingCreateManyPlayerInputEnvelope
    connect?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
  }

  export type TrendingPlayerCreateNestedManyWithoutPlayerInput = {
    create?: XOR<TrendingPlayerCreateWithoutPlayerInput, TrendingPlayerUncheckedCreateWithoutPlayerInput> | TrendingPlayerCreateWithoutPlayerInput[] | TrendingPlayerUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: TrendingPlayerCreateOrConnectWithoutPlayerInput | TrendingPlayerCreateOrConnectWithoutPlayerInput[]
    createMany?: TrendingPlayerCreateManyPlayerInputEnvelope
    connect?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
  }

  export type PlayerRankingUncheckedCreateNestedManyWithoutPlayerInput = {
    create?: XOR<PlayerRankingCreateWithoutPlayerInput, PlayerRankingUncheckedCreateWithoutPlayerInput> | PlayerRankingCreateWithoutPlayerInput[] | PlayerRankingUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: PlayerRankingCreateOrConnectWithoutPlayerInput | PlayerRankingCreateOrConnectWithoutPlayerInput[]
    createMany?: PlayerRankingCreateManyPlayerInputEnvelope
    connect?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
  }

  export type TrendingPlayerUncheckedCreateNestedManyWithoutPlayerInput = {
    create?: XOR<TrendingPlayerCreateWithoutPlayerInput, TrendingPlayerUncheckedCreateWithoutPlayerInput> | TrendingPlayerCreateWithoutPlayerInput[] | TrendingPlayerUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: TrendingPlayerCreateOrConnectWithoutPlayerInput | TrendingPlayerCreateOrConnectWithoutPlayerInput[]
    createMany?: TrendingPlayerCreateManyPlayerInputEnvelope
    connect?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
  }

  export type PlayerRankingUpdateManyWithoutPlayerNestedInput = {
    create?: XOR<PlayerRankingCreateWithoutPlayerInput, PlayerRankingUncheckedCreateWithoutPlayerInput> | PlayerRankingCreateWithoutPlayerInput[] | PlayerRankingUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: PlayerRankingCreateOrConnectWithoutPlayerInput | PlayerRankingCreateOrConnectWithoutPlayerInput[]
    upsert?: PlayerRankingUpsertWithWhereUniqueWithoutPlayerInput | PlayerRankingUpsertWithWhereUniqueWithoutPlayerInput[]
    createMany?: PlayerRankingCreateManyPlayerInputEnvelope
    set?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    disconnect?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    delete?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    connect?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    update?: PlayerRankingUpdateWithWhereUniqueWithoutPlayerInput | PlayerRankingUpdateWithWhereUniqueWithoutPlayerInput[]
    updateMany?: PlayerRankingUpdateManyWithWhereWithoutPlayerInput | PlayerRankingUpdateManyWithWhereWithoutPlayerInput[]
    deleteMany?: PlayerRankingScalarWhereInput | PlayerRankingScalarWhereInput[]
  }

  export type TrendingPlayerUpdateManyWithoutPlayerNestedInput = {
    create?: XOR<TrendingPlayerCreateWithoutPlayerInput, TrendingPlayerUncheckedCreateWithoutPlayerInput> | TrendingPlayerCreateWithoutPlayerInput[] | TrendingPlayerUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: TrendingPlayerCreateOrConnectWithoutPlayerInput | TrendingPlayerCreateOrConnectWithoutPlayerInput[]
    upsert?: TrendingPlayerUpsertWithWhereUniqueWithoutPlayerInput | TrendingPlayerUpsertWithWhereUniqueWithoutPlayerInput[]
    createMany?: TrendingPlayerCreateManyPlayerInputEnvelope
    set?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    disconnect?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    delete?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    connect?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    update?: TrendingPlayerUpdateWithWhereUniqueWithoutPlayerInput | TrendingPlayerUpdateWithWhereUniqueWithoutPlayerInput[]
    updateMany?: TrendingPlayerUpdateManyWithWhereWithoutPlayerInput | TrendingPlayerUpdateManyWithWhereWithoutPlayerInput[]
    deleteMany?: TrendingPlayerScalarWhereInput | TrendingPlayerScalarWhereInput[]
  }

  export type PlayerRankingUncheckedUpdateManyWithoutPlayerNestedInput = {
    create?: XOR<PlayerRankingCreateWithoutPlayerInput, PlayerRankingUncheckedCreateWithoutPlayerInput> | PlayerRankingCreateWithoutPlayerInput[] | PlayerRankingUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: PlayerRankingCreateOrConnectWithoutPlayerInput | PlayerRankingCreateOrConnectWithoutPlayerInput[]
    upsert?: PlayerRankingUpsertWithWhereUniqueWithoutPlayerInput | PlayerRankingUpsertWithWhereUniqueWithoutPlayerInput[]
    createMany?: PlayerRankingCreateManyPlayerInputEnvelope
    set?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    disconnect?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    delete?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    connect?: PlayerRankingWhereUniqueInput | PlayerRankingWhereUniqueInput[]
    update?: PlayerRankingUpdateWithWhereUniqueWithoutPlayerInput | PlayerRankingUpdateWithWhereUniqueWithoutPlayerInput[]
    updateMany?: PlayerRankingUpdateManyWithWhereWithoutPlayerInput | PlayerRankingUpdateManyWithWhereWithoutPlayerInput[]
    deleteMany?: PlayerRankingScalarWhereInput | PlayerRankingScalarWhereInput[]
  }

  export type TrendingPlayerUncheckedUpdateManyWithoutPlayerNestedInput = {
    create?: XOR<TrendingPlayerCreateWithoutPlayerInput, TrendingPlayerUncheckedCreateWithoutPlayerInput> | TrendingPlayerCreateWithoutPlayerInput[] | TrendingPlayerUncheckedCreateWithoutPlayerInput[]
    connectOrCreate?: TrendingPlayerCreateOrConnectWithoutPlayerInput | TrendingPlayerCreateOrConnectWithoutPlayerInput[]
    upsert?: TrendingPlayerUpsertWithWhereUniqueWithoutPlayerInput | TrendingPlayerUpsertWithWhereUniqueWithoutPlayerInput[]
    createMany?: TrendingPlayerCreateManyPlayerInputEnvelope
    set?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    disconnect?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    delete?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    connect?: TrendingPlayerWhereUniqueInput | TrendingPlayerWhereUniqueInput[]
    update?: TrendingPlayerUpdateWithWhereUniqueWithoutPlayerInput | TrendingPlayerUpdateWithWhereUniqueWithoutPlayerInput[]
    updateMany?: TrendingPlayerUpdateManyWithWhereWithoutPlayerInput | TrendingPlayerUpdateManyWithWhereWithoutPlayerInput[]
    deleteMany?: TrendingPlayerScalarWhereInput | TrendingPlayerScalarWhereInput[]
  }

  export type PlayerCreateNestedOneWithoutRankingsInput = {
    create?: XOR<PlayerCreateWithoutRankingsInput, PlayerUncheckedCreateWithoutRankingsInput>
    connectOrCreate?: PlayerCreateOrConnectWithoutRankingsInput
    connect?: PlayerWhereUniqueInput
  }

  export type PlayerUpdateOneRequiredWithoutRankingsNestedInput = {
    create?: XOR<PlayerCreateWithoutRankingsInput, PlayerUncheckedCreateWithoutRankingsInput>
    connectOrCreate?: PlayerCreateOrConnectWithoutRankingsInput
    upsert?: PlayerUpsertWithoutRankingsInput
    connect?: PlayerWhereUniqueInput
    update?: XOR<XOR<PlayerUpdateToOneWithWhereWithoutRankingsInput, PlayerUpdateWithoutRankingsInput>, PlayerUncheckedUpdateWithoutRankingsInput>
  }

  export type PlayerCreateNestedOneWithoutTrendingInput = {
    create?: XOR<PlayerCreateWithoutTrendingInput, PlayerUncheckedCreateWithoutTrendingInput>
    connectOrCreate?: PlayerCreateOrConnectWithoutTrendingInput
    connect?: PlayerWhereUniqueInput
  }

  export type EnumTrendingTypeFieldUpdateOperationsInput = {
    set?: $Enums.TrendingType
  }

  export type PlayerUpdateOneRequiredWithoutTrendingNestedInput = {
    create?: XOR<PlayerCreateWithoutTrendingInput, PlayerUncheckedCreateWithoutTrendingInput>
    connectOrCreate?: PlayerCreateOrConnectWithoutTrendingInput
    upsert?: PlayerUpsertWithoutTrendingInput
    connect?: PlayerWhereUniqueInput
    update?: XOR<XOR<PlayerUpdateToOneWithWhereWithoutTrendingInput, PlayerUpdateWithoutTrendingInput>, PlayerUncheckedUpdateWithoutTrendingInput>
  }

  export type ContentItemCreateplayerIdsInput = {
    set: string[]
  }

  export type ContentItemCreateteamSlugsInput = {
    set: string[]
  }

  export type ContentItemCreatetopicsInput = {
    set: string[]
  }

  export type ContentSourceCreateNestedOneWithoutItemsInput = {
    create?: XOR<ContentSourceCreateWithoutItemsInput, ContentSourceUncheckedCreateWithoutItemsInput>
    connectOrCreate?: ContentSourceCreateOrConnectWithoutItemsInput
    connect?: ContentSourceWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ContentItemUpdateplayerIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ContentItemUpdateteamSlugsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ContentItemUpdatetopicsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ContentSourceUpdateOneWithoutItemsNestedInput = {
    create?: XOR<ContentSourceCreateWithoutItemsInput, ContentSourceUncheckedCreateWithoutItemsInput>
    connectOrCreate?: ContentSourceCreateOrConnectWithoutItemsInput
    upsert?: ContentSourceUpsertWithoutItemsInput
    disconnect?: ContentSourceWhereInput | boolean
    delete?: ContentSourceWhereInput | boolean
    connect?: ContentSourceWhereUniqueInput
    update?: XOR<XOR<ContentSourceUpdateToOneWithWhereWithoutItemsInput, ContentSourceUpdateWithoutItemsInput>, ContentSourceUncheckedUpdateWithoutItemsInput>
  }

  export type ContentItemCreateNestedManyWithoutSourceInput = {
    create?: XOR<ContentItemCreateWithoutSourceInput, ContentItemUncheckedCreateWithoutSourceInput> | ContentItemCreateWithoutSourceInput[] | ContentItemUncheckedCreateWithoutSourceInput[]
    connectOrCreate?: ContentItemCreateOrConnectWithoutSourceInput | ContentItemCreateOrConnectWithoutSourceInput[]
    createMany?: ContentItemCreateManySourceInputEnvelope
    connect?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
  }

  export type ContentItemUncheckedCreateNestedManyWithoutSourceInput = {
    create?: XOR<ContentItemCreateWithoutSourceInput, ContentItemUncheckedCreateWithoutSourceInput> | ContentItemCreateWithoutSourceInput[] | ContentItemUncheckedCreateWithoutSourceInput[]
    connectOrCreate?: ContentItemCreateOrConnectWithoutSourceInput | ContentItemCreateOrConnectWithoutSourceInput[]
    createMany?: ContentItemCreateManySourceInputEnvelope
    connect?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
  }

  export type ContentItemUpdateManyWithoutSourceNestedInput = {
    create?: XOR<ContentItemCreateWithoutSourceInput, ContentItemUncheckedCreateWithoutSourceInput> | ContentItemCreateWithoutSourceInput[] | ContentItemUncheckedCreateWithoutSourceInput[]
    connectOrCreate?: ContentItemCreateOrConnectWithoutSourceInput | ContentItemCreateOrConnectWithoutSourceInput[]
    upsert?: ContentItemUpsertWithWhereUniqueWithoutSourceInput | ContentItemUpsertWithWhereUniqueWithoutSourceInput[]
    createMany?: ContentItemCreateManySourceInputEnvelope
    set?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    disconnect?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    delete?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    connect?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    update?: ContentItemUpdateWithWhereUniqueWithoutSourceInput | ContentItemUpdateWithWhereUniqueWithoutSourceInput[]
    updateMany?: ContentItemUpdateManyWithWhereWithoutSourceInput | ContentItemUpdateManyWithWhereWithoutSourceInput[]
    deleteMany?: ContentItemScalarWhereInput | ContentItemScalarWhereInput[]
  }

  export type ContentItemUncheckedUpdateManyWithoutSourceNestedInput = {
    create?: XOR<ContentItemCreateWithoutSourceInput, ContentItemUncheckedCreateWithoutSourceInput> | ContentItemCreateWithoutSourceInput[] | ContentItemUncheckedCreateWithoutSourceInput[]
    connectOrCreate?: ContentItemCreateOrConnectWithoutSourceInput | ContentItemCreateOrConnectWithoutSourceInput[]
    upsert?: ContentItemUpsertWithWhereUniqueWithoutSourceInput | ContentItemUpsertWithWhereUniqueWithoutSourceInput[]
    createMany?: ContentItemCreateManySourceInputEnvelope
    set?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    disconnect?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    delete?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    connect?: ContentItemWhereUniqueInput | ContentItemWhereUniqueInput[]
    update?: ContentItemUpdateWithWhereUniqueWithoutSourceInput | ContentItemUpdateWithWhereUniqueWithoutSourceInput[]
    updateMany?: ContentItemUpdateManyWithWhereWithoutSourceInput | ContentItemUpdateManyWithWhereWithoutSourceInput[]
    deleteMany?: ContentItemScalarWhereInput | ContentItemScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumUserTierFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierFilter<$PrismaModel> | $Enums.UserTier
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumUserTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserTier | EnumUserTierFieldRefInput<$PrismaModel>
    in?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserTier[] | ListEnumUserTierFieldRefInput<$PrismaModel>
    not?: NestedEnumUserTierWithAggregatesFilter<$PrismaModel> | $Enums.UserTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserTierFilter<$PrismaModel>
    _max?: NestedEnumUserTierFilter<$PrismaModel>
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumLeagueStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStyle | EnumLeagueStyleFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStyleFilter<$PrismaModel> | $Enums.LeagueStyle
  }

  export type NestedEnumScoringPriorityFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringPriority | EnumScoringPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumScoringPriorityFilter<$PrismaModel> | $Enums.ScoringPriority
  }

  export type NestedEnumPlayStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.PlayStyle | EnumPlayStyleFieldRefInput<$PrismaModel>
    in?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumPlayStyleFilter<$PrismaModel> | $Enums.PlayStyle
  }

  export type NestedEnumReportFormatFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportFormat | EnumReportFormatFieldRefInput<$PrismaModel>
    in?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    not?: NestedEnumReportFormatFilter<$PrismaModel> | $Enums.ReportFormat
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumLeagueStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeagueStyle | EnumLeagueStyleFieldRefInput<$PrismaModel>
    in?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeagueStyle[] | ListEnumLeagueStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumLeagueStyleWithAggregatesFilter<$PrismaModel> | $Enums.LeagueStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeagueStyleFilter<$PrismaModel>
    _max?: NestedEnumLeagueStyleFilter<$PrismaModel>
  }

  export type NestedEnumScoringPriorityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ScoringPriority | EnumScoringPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.ScoringPriority[] | ListEnumScoringPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumScoringPriorityWithAggregatesFilter<$PrismaModel> | $Enums.ScoringPriority
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumScoringPriorityFilter<$PrismaModel>
    _max?: NestedEnumScoringPriorityFilter<$PrismaModel>
  }

  export type NestedEnumPlayStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlayStyle | EnumPlayStyleFieldRefInput<$PrismaModel>
    in?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlayStyle[] | ListEnumPlayStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumPlayStyleWithAggregatesFilter<$PrismaModel> | $Enums.PlayStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlayStyleFilter<$PrismaModel>
    _max?: NestedEnumPlayStyleFilter<$PrismaModel>
  }

  export type NestedEnumReportFormatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReportFormat | EnumReportFormatFieldRefInput<$PrismaModel>
    in?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReportFormat[] | ListEnumReportFormatFieldRefInput<$PrismaModel>
    not?: NestedEnumReportFormatWithAggregatesFilter<$PrismaModel> | $Enums.ReportFormat
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReportFormatFilter<$PrismaModel>
    _max?: NestedEnumReportFormatFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumAgentRunStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusFilter<$PrismaModel> | $Enums.AgentRunStatus
  }

  export type NestedEnumAgentResultRatingNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentResultRating | EnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    in?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAgentResultRatingNullableFilter<$PrismaModel> | $Enums.AgentResultRating | null
  }

  export type NestedEnumAgentRunStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentRunStatus | EnumAgentRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AgentRunStatus[] | ListEnumAgentRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAgentRunStatusWithAggregatesFilter<$PrismaModel> | $Enums.AgentRunStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAgentRunStatusFilter<$PrismaModel>
    _max?: NestedEnumAgentRunStatusFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumAgentResultRatingNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AgentResultRating | EnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    in?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AgentResultRating[] | ListEnumAgentResultRatingFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAgentResultRatingNullableWithAggregatesFilter<$PrismaModel> | $Enums.AgentResultRating | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumAgentResultRatingNullableFilter<$PrismaModel>
    _max?: NestedEnumAgentResultRatingNullableFilter<$PrismaModel>
  }

  export type NestedEnumTrendingTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TrendingType | EnumTrendingTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTrendingTypeFilter<$PrismaModel> | $Enums.TrendingType
  }

  export type NestedEnumTrendingTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrendingType | EnumTrendingTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TrendingType[] | ListEnumTrendingTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTrendingTypeWithAggregatesFilter<$PrismaModel> | $Enums.TrendingType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrendingTypeFilter<$PrismaModel>
    _max?: NestedEnumTrendingTypeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type SleeperProfileCreateWithoutUserInput = {
    id?: string
    sleeperId: string
    displayName: string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type SleeperProfileUncheckedCreateWithoutUserInput = {
    id?: string
    sleeperId: string
    displayName: string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type SleeperProfileCreateOrConnectWithoutUserInput = {
    where: SleeperProfileWhereUniqueInput
    create: XOR<SleeperProfileCreateWithoutUserInput, SleeperProfileUncheckedCreateWithoutUserInput>
  }

  export type UserPreferencesCreateWithoutUserInput = {
    id?: string
    leagueStyle?: $Enums.LeagueStyle
    scoringPriority?: $Enums.ScoringPriority
    playStyle?: $Enums.PlayStyle
    reportFormat?: $Enums.ReportFormat
    priorityPositions?: UserPreferencesCreatepriorityPositionsInput | string[]
    customInstructions?: string | null
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: Date | string
  }

  export type UserPreferencesUncheckedCreateWithoutUserInput = {
    id?: string
    leagueStyle?: $Enums.LeagueStyle
    scoringPriority?: $Enums.ScoringPriority
    playStyle?: $Enums.PlayStyle
    reportFormat?: $Enums.ReportFormat
    priorityPositions?: UserPreferencesCreatepriorityPositionsInput | string[]
    customInstructions?: string | null
    notifyOnInjury?: boolean
    notifyOnTrending?: boolean
    updatedAt?: Date | string
  }

  export type UserPreferencesCreateOrConnectWithoutUserInput = {
    where: UserPreferencesWhereUniqueInput
    create: XOR<UserPreferencesCreateWithoutUserInput, UserPreferencesUncheckedCreateWithoutUserInput>
  }

  export type AgentRunCreateWithoutUserInput = {
    id?: string
    agentType: string
    status?: $Enums.AgentRunStatus
    inputJson: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: number | null
    durationMs?: number | null
    rating?: $Enums.AgentResultRating | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunUncheckedCreateWithoutUserInput = {
    id?: string
    agentType: string
    status?: $Enums.AgentRunStatus
    inputJson: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: number | null
    durationMs?: number | null
    rating?: $Enums.AgentResultRating | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentRunCreateOrConnectWithoutUserInput = {
    where: AgentRunWhereUniqueInput
    create: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput>
  }

  export type AgentRunCreateManyUserInputEnvelope = {
    data: AgentRunCreateManyUserInput | AgentRunCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TokenBudgetCreateWithoutUserInput = {
    id?: string
    periodStart: Date | string
    tokensUsed?: number
    runsUsed?: number
  }

  export type TokenBudgetUncheckedCreateWithoutUserInput = {
    id?: string
    periodStart: Date | string
    tokensUsed?: number
    runsUsed?: number
  }

  export type TokenBudgetCreateOrConnectWithoutUserInput = {
    where: TokenBudgetWhereUniqueInput
    create: XOR<TokenBudgetCreateWithoutUserInput, TokenBudgetUncheckedCreateWithoutUserInput>
  }

  export type TokenBudgetCreateManyUserInputEnvelope = {
    data: TokenBudgetCreateManyUserInput | TokenBudgetCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AnalyticsEventCreateWithoutUserInput = {
    id?: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AnalyticsEventUncheckedCreateWithoutUserInput = {
    id?: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AnalyticsEventCreateOrConnectWithoutUserInput = {
    where: AnalyticsEventWhereUniqueInput
    create: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>
  }

  export type AnalyticsEventCreateManyUserInputEnvelope = {
    data: AnalyticsEventCreateManyUserInput | AnalyticsEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SleeperProfileUpsertWithoutUserInput = {
    update: XOR<SleeperProfileUpdateWithoutUserInput, SleeperProfileUncheckedUpdateWithoutUserInput>
    create: XOR<SleeperProfileCreateWithoutUserInput, SleeperProfileUncheckedCreateWithoutUserInput>
    where?: SleeperProfileWhereInput
  }

  export type SleeperProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: SleeperProfileWhereInput
    data: XOR<SleeperProfileUpdateWithoutUserInput, SleeperProfileUncheckedUpdateWithoutUserInput>
  }

  export type SleeperProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sleeperId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SleeperProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sleeperId?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    leagues?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesUpsertWithoutUserInput = {
    update: XOR<UserPreferencesUpdateWithoutUserInput, UserPreferencesUncheckedUpdateWithoutUserInput>
    create: XOR<UserPreferencesCreateWithoutUserInput, UserPreferencesUncheckedCreateWithoutUserInput>
    where?: UserPreferencesWhereInput
  }

  export type UserPreferencesUpdateToOneWithWhereWithoutUserInput = {
    where?: UserPreferencesWhereInput
    data: XOR<UserPreferencesUpdateWithoutUserInput, UserPreferencesUncheckedUpdateWithoutUserInput>
  }

  export type UserPreferencesUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueStyle?: EnumLeagueStyleFieldUpdateOperationsInput | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFieldUpdateOperationsInput | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFieldUpdateOperationsInput | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFieldUpdateOperationsInput | $Enums.ReportFormat
    priorityPositions?: UserPreferencesUpdatepriorityPositionsInput | string[]
    customInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    notifyOnInjury?: BoolFieldUpdateOperationsInput | boolean
    notifyOnTrending?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    leagueStyle?: EnumLeagueStyleFieldUpdateOperationsInput | $Enums.LeagueStyle
    scoringPriority?: EnumScoringPriorityFieldUpdateOperationsInput | $Enums.ScoringPriority
    playStyle?: EnumPlayStyleFieldUpdateOperationsInput | $Enums.PlayStyle
    reportFormat?: EnumReportFormatFieldUpdateOperationsInput | $Enums.ReportFormat
    priorityPositions?: UserPreferencesUpdatepriorityPositionsInput | string[]
    customInstructions?: NullableStringFieldUpdateOperationsInput | string | null
    notifyOnInjury?: BoolFieldUpdateOperationsInput | boolean
    notifyOnTrending?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUpsertWithWhereUniqueWithoutUserInput = {
    where: AgentRunWhereUniqueInput
    update: XOR<AgentRunUpdateWithoutUserInput, AgentRunUncheckedUpdateWithoutUserInput>
    create: XOR<AgentRunCreateWithoutUserInput, AgentRunUncheckedCreateWithoutUserInput>
  }

  export type AgentRunUpdateWithWhereUniqueWithoutUserInput = {
    where: AgentRunWhereUniqueInput
    data: XOR<AgentRunUpdateWithoutUserInput, AgentRunUncheckedUpdateWithoutUserInput>
  }

  export type AgentRunUpdateManyWithWhereWithoutUserInput = {
    where: AgentRunScalarWhereInput
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyWithoutUserInput>
  }

  export type AgentRunScalarWhereInput = {
    AND?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
    OR?: AgentRunScalarWhereInput[]
    NOT?: AgentRunScalarWhereInput | AgentRunScalarWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    userId?: StringFilter<"AgentRun"> | string
    agentType?: StringFilter<"AgentRun"> | string
    status?: EnumAgentRunStatusFilter<"AgentRun"> | $Enums.AgentRunStatus
    inputJson?: JsonFilter<"AgentRun">
    outputJson?: JsonNullableFilter<"AgentRun">
    tokensUsed?: IntNullableFilter<"AgentRun"> | number | null
    durationMs?: IntNullableFilter<"AgentRun"> | number | null
    rating?: EnumAgentResultRatingNullableFilter<"AgentRun"> | $Enums.AgentResultRating | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
    updatedAt?: DateTimeFilter<"AgentRun"> | Date | string
  }

  export type TokenBudgetUpsertWithWhereUniqueWithoutUserInput = {
    where: TokenBudgetWhereUniqueInput
    update: XOR<TokenBudgetUpdateWithoutUserInput, TokenBudgetUncheckedUpdateWithoutUserInput>
    create: XOR<TokenBudgetCreateWithoutUserInput, TokenBudgetUncheckedCreateWithoutUserInput>
  }

  export type TokenBudgetUpdateWithWhereUniqueWithoutUserInput = {
    where: TokenBudgetWhereUniqueInput
    data: XOR<TokenBudgetUpdateWithoutUserInput, TokenBudgetUncheckedUpdateWithoutUserInput>
  }

  export type TokenBudgetUpdateManyWithWhereWithoutUserInput = {
    where: TokenBudgetScalarWhereInput
    data: XOR<TokenBudgetUpdateManyMutationInput, TokenBudgetUncheckedUpdateManyWithoutUserInput>
  }

  export type TokenBudgetScalarWhereInput = {
    AND?: TokenBudgetScalarWhereInput | TokenBudgetScalarWhereInput[]
    OR?: TokenBudgetScalarWhereInput[]
    NOT?: TokenBudgetScalarWhereInput | TokenBudgetScalarWhereInput[]
    id?: StringFilter<"TokenBudget"> | string
    userId?: StringFilter<"TokenBudget"> | string
    periodStart?: DateTimeFilter<"TokenBudget"> | Date | string
    tokensUsed?: IntFilter<"TokenBudget"> | number
    runsUsed?: IntFilter<"TokenBudget"> | number
  }

  export type AnalyticsEventUpsertWithWhereUniqueWithoutUserInput = {
    where: AnalyticsEventWhereUniqueInput
    update: XOR<AnalyticsEventUpdateWithoutUserInput, AnalyticsEventUncheckedUpdateWithoutUserInput>
    create: XOR<AnalyticsEventCreateWithoutUserInput, AnalyticsEventUncheckedCreateWithoutUserInput>
  }

  export type AnalyticsEventUpdateWithWhereUniqueWithoutUserInput = {
    where: AnalyticsEventWhereUniqueInput
    data: XOR<AnalyticsEventUpdateWithoutUserInput, AnalyticsEventUncheckedUpdateWithoutUserInput>
  }

  export type AnalyticsEventUpdateManyWithWhereWithoutUserInput = {
    where: AnalyticsEventScalarWhereInput
    data: XOR<AnalyticsEventUpdateManyMutationInput, AnalyticsEventUncheckedUpdateManyWithoutUserInput>
  }

  export type AnalyticsEventScalarWhereInput = {
    AND?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[]
    OR?: AnalyticsEventScalarWhereInput[]
    NOT?: AnalyticsEventScalarWhereInput | AnalyticsEventScalarWhereInput[]
    id?: StringFilter<"AnalyticsEvent"> | string
    userId?: StringNullableFilter<"AnalyticsEvent"> | string | null
    eventType?: StringFilter<"AnalyticsEvent"> | string
    payload?: JsonFilter<"AnalyticsEvent">
    createdAt?: DateTimeFilter<"AnalyticsEvent"> | Date | string
  }

  export type UserCreateWithoutSleeperProfileInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    preferences?: UserPreferencesCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSleeperProfileInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    preferences?: UserPreferencesUncheckedCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetUncheckedCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSleeperProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSleeperProfileInput, UserUncheckedCreateWithoutSleeperProfileInput>
  }

  export type UserUpsertWithoutSleeperProfileInput = {
    update: XOR<UserUpdateWithoutSleeperProfileInput, UserUncheckedUpdateWithoutSleeperProfileInput>
    create: XOR<UserCreateWithoutSleeperProfileInput, UserUncheckedCreateWithoutSleeperProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSleeperProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSleeperProfileInput, UserUncheckedUpdateWithoutSleeperProfileInput>
  }

  export type UserUpdateWithoutSleeperProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    preferences?: UserPreferencesUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSleeperProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    preferences?: UserPreferencesUncheckedUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUncheckedUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPreferencesInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPreferencesInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileUncheckedCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetUncheckedCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPreferencesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPreferencesInput, UserUncheckedCreateWithoutPreferencesInput>
  }

  export type UserUpsertWithoutPreferencesInput = {
    update: XOR<UserUpdateWithoutPreferencesInput, UserUncheckedUpdateWithoutPreferencesInput>
    create: XOR<UserCreateWithoutPreferencesInput, UserUncheckedCreateWithoutPreferencesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPreferencesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPreferencesInput, UserUncheckedUpdateWithoutPreferencesInput>
  }

  export type UserUpdateWithoutPreferencesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPreferencesInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUncheckedUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUncheckedUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAgentRunsInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesCreateNestedOneWithoutUserInput
    tokenBudget?: TokenBudgetCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAgentRunsInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileUncheckedCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesUncheckedCreateNestedOneWithoutUserInput
    tokenBudget?: TokenBudgetUncheckedCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAgentRunsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
  }

  export type UserUpsertWithoutAgentRunsInput = {
    update: XOR<UserUpdateWithoutAgentRunsInput, UserUncheckedUpdateWithoutAgentRunsInput>
    create: XOR<UserCreateWithoutAgentRunsInput, UserUncheckedCreateWithoutAgentRunsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAgentRunsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAgentRunsInput, UserUncheckedUpdateWithoutAgentRunsInput>
  }

  export type UserUpdateWithoutAgentRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUpdateOneWithoutUserNestedInput
    tokenBudget?: TokenBudgetUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAgentRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUncheckedUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUncheckedUpdateOneWithoutUserNestedInput
    tokenBudget?: TokenBudgetUncheckedUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutTokenBudgetInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTokenBudgetInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileUncheckedCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesUncheckedCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    analyticsEvents?: AnalyticsEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTokenBudgetInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTokenBudgetInput, UserUncheckedCreateWithoutTokenBudgetInput>
  }

  export type UserUpsertWithoutTokenBudgetInput = {
    update: XOR<UserUpdateWithoutTokenBudgetInput, UserUncheckedUpdateWithoutTokenBudgetInput>
    create: XOR<UserCreateWithoutTokenBudgetInput, UserUncheckedCreateWithoutTokenBudgetInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTokenBudgetInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTokenBudgetInput, UserUncheckedUpdateWithoutTokenBudgetInput>
  }

  export type UserUpdateWithoutTokenBudgetInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTokenBudgetInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUncheckedUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUncheckedUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    analyticsEvents?: AnalyticsEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAnalyticsEventsInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAnalyticsEventsInput = {
    id?: string
    clerkId: string
    email: string
    tier?: $Enums.UserTier
    role?: $Enums.UserRole
    runCredits?: number
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    stripeSubscriptionStatus?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sleeperProfile?: SleeperProfileUncheckedCreateNestedOneWithoutUserInput
    preferences?: UserPreferencesUncheckedCreateNestedOneWithoutUserInput
    agentRuns?: AgentRunUncheckedCreateNestedManyWithoutUserInput
    tokenBudget?: TokenBudgetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAnalyticsEventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>
  }

  export type UserUpsertWithoutAnalyticsEventsInput = {
    update: XOR<UserUpdateWithoutAnalyticsEventsInput, UserUncheckedUpdateWithoutAnalyticsEventsInput>
    create: XOR<UserCreateWithoutAnalyticsEventsInput, UserUncheckedCreateWithoutAnalyticsEventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAnalyticsEventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAnalyticsEventsInput, UserUncheckedUpdateWithoutAnalyticsEventsInput>
  }

  export type UserUpdateWithoutAnalyticsEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAnalyticsEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerkId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    tier?: EnumUserTierFieldUpdateOperationsInput | $Enums.UserTier
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    runCredits?: IntFieldUpdateOperationsInput | number
    stripeCustomerId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionId?: NullableStringFieldUpdateOperationsInput | string | null
    stripeSubscriptionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sleeperProfile?: SleeperProfileUncheckedUpdateOneWithoutUserNestedInput
    preferences?: UserPreferencesUncheckedUpdateOneWithoutUserNestedInput
    agentRuns?: AgentRunUncheckedUpdateManyWithoutUserNestedInput
    tokenBudget?: TokenBudgetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PlayerRankingCreateWithoutPlayerInput = {
    id?: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt?: Date | string
  }

  export type PlayerRankingUncheckedCreateWithoutPlayerInput = {
    id?: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt?: Date | string
  }

  export type PlayerRankingCreateOrConnectWithoutPlayerInput = {
    where: PlayerRankingWhereUniqueInput
    create: XOR<PlayerRankingCreateWithoutPlayerInput, PlayerRankingUncheckedCreateWithoutPlayerInput>
  }

  export type PlayerRankingCreateManyPlayerInputEnvelope = {
    data: PlayerRankingCreateManyPlayerInput | PlayerRankingCreateManyPlayerInput[]
    skipDuplicates?: boolean
  }

  export type TrendingPlayerCreateWithoutPlayerInput = {
    id?: string
    type: $Enums.TrendingType
    count: number
    lookbackHours?: number
    fetchedAt?: Date | string
  }

  export type TrendingPlayerUncheckedCreateWithoutPlayerInput = {
    id?: string
    type: $Enums.TrendingType
    count: number
    lookbackHours?: number
    fetchedAt?: Date | string
  }

  export type TrendingPlayerCreateOrConnectWithoutPlayerInput = {
    where: TrendingPlayerWhereUniqueInput
    create: XOR<TrendingPlayerCreateWithoutPlayerInput, TrendingPlayerUncheckedCreateWithoutPlayerInput>
  }

  export type TrendingPlayerCreateManyPlayerInputEnvelope = {
    data: TrendingPlayerCreateManyPlayerInput | TrendingPlayerCreateManyPlayerInput[]
    skipDuplicates?: boolean
  }

  export type PlayerRankingUpsertWithWhereUniqueWithoutPlayerInput = {
    where: PlayerRankingWhereUniqueInput
    update: XOR<PlayerRankingUpdateWithoutPlayerInput, PlayerRankingUncheckedUpdateWithoutPlayerInput>
    create: XOR<PlayerRankingCreateWithoutPlayerInput, PlayerRankingUncheckedCreateWithoutPlayerInput>
  }

  export type PlayerRankingUpdateWithWhereUniqueWithoutPlayerInput = {
    where: PlayerRankingWhereUniqueInput
    data: XOR<PlayerRankingUpdateWithoutPlayerInput, PlayerRankingUncheckedUpdateWithoutPlayerInput>
  }

  export type PlayerRankingUpdateManyWithWhereWithoutPlayerInput = {
    where: PlayerRankingScalarWhereInput
    data: XOR<PlayerRankingUpdateManyMutationInput, PlayerRankingUncheckedUpdateManyWithoutPlayerInput>
  }

  export type PlayerRankingScalarWhereInput = {
    AND?: PlayerRankingScalarWhereInput | PlayerRankingScalarWhereInput[]
    OR?: PlayerRankingScalarWhereInput[]
    NOT?: PlayerRankingScalarWhereInput | PlayerRankingScalarWhereInput[]
    id?: StringFilter<"PlayerRanking"> | string
    playerId?: StringFilter<"PlayerRanking"> | string
    source?: StringFilter<"PlayerRanking"> | string
    rankOverall?: IntFilter<"PlayerRanking"> | number
    rankPosition?: IntFilter<"PlayerRanking"> | number
    week?: IntFilter<"PlayerRanking"> | number
    season?: IntFilter<"PlayerRanking"> | number
    fetchedAt?: DateTimeFilter<"PlayerRanking"> | Date | string
  }

  export type TrendingPlayerUpsertWithWhereUniqueWithoutPlayerInput = {
    where: TrendingPlayerWhereUniqueInput
    update: XOR<TrendingPlayerUpdateWithoutPlayerInput, TrendingPlayerUncheckedUpdateWithoutPlayerInput>
    create: XOR<TrendingPlayerCreateWithoutPlayerInput, TrendingPlayerUncheckedCreateWithoutPlayerInput>
  }

  export type TrendingPlayerUpdateWithWhereUniqueWithoutPlayerInput = {
    where: TrendingPlayerWhereUniqueInput
    data: XOR<TrendingPlayerUpdateWithoutPlayerInput, TrendingPlayerUncheckedUpdateWithoutPlayerInput>
  }

  export type TrendingPlayerUpdateManyWithWhereWithoutPlayerInput = {
    where: TrendingPlayerScalarWhereInput
    data: XOR<TrendingPlayerUpdateManyMutationInput, TrendingPlayerUncheckedUpdateManyWithoutPlayerInput>
  }

  export type TrendingPlayerScalarWhereInput = {
    AND?: TrendingPlayerScalarWhereInput | TrendingPlayerScalarWhereInput[]
    OR?: TrendingPlayerScalarWhereInput[]
    NOT?: TrendingPlayerScalarWhereInput | TrendingPlayerScalarWhereInput[]
    id?: StringFilter<"TrendingPlayer"> | string
    playerId?: StringFilter<"TrendingPlayer"> | string
    type?: EnumTrendingTypeFilter<"TrendingPlayer"> | $Enums.TrendingType
    count?: IntFilter<"TrendingPlayer"> | number
    lookbackHours?: IntFilter<"TrendingPlayer"> | number
    fetchedAt?: DateTimeFilter<"TrendingPlayer"> | Date | string
  }

  export type PlayerCreateWithoutRankingsInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
    trending?: TrendingPlayerCreateNestedManyWithoutPlayerInput
  }

  export type PlayerUncheckedCreateWithoutRankingsInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
    trending?: TrendingPlayerUncheckedCreateNestedManyWithoutPlayerInput
  }

  export type PlayerCreateOrConnectWithoutRankingsInput = {
    where: PlayerWhereUniqueInput
    create: XOR<PlayerCreateWithoutRankingsInput, PlayerUncheckedCreateWithoutRankingsInput>
  }

  export type PlayerUpsertWithoutRankingsInput = {
    update: XOR<PlayerUpdateWithoutRankingsInput, PlayerUncheckedUpdateWithoutRankingsInput>
    create: XOR<PlayerCreateWithoutRankingsInput, PlayerUncheckedCreateWithoutRankingsInput>
    where?: PlayerWhereInput
  }

  export type PlayerUpdateToOneWithWhereWithoutRankingsInput = {
    where?: PlayerWhereInput
    data: XOR<PlayerUpdateWithoutRankingsInput, PlayerUncheckedUpdateWithoutRankingsInput>
  }

  export type PlayerUpdateWithoutRankingsInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trending?: TrendingPlayerUpdateManyWithoutPlayerNestedInput
  }

  export type PlayerUncheckedUpdateWithoutRankingsInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trending?: TrendingPlayerUncheckedUpdateManyWithoutPlayerNestedInput
  }

  export type PlayerCreateWithoutTrendingInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
    rankings?: PlayerRankingCreateNestedManyWithoutPlayerInput
  }

  export type PlayerUncheckedCreateWithoutTrendingInput = {
    sleeperId: string
    firstName: string
    lastName: string
    position: string
    team?: string | null
    status: string
    injuryStatus?: string | null
    practiceParticipation?: string | null
    depthChartPosition?: string | null
    depthChartOrder?: number | null
    searchRank?: number | null
    age?: number | null
    yearsExp?: number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: Date | string
    rankings?: PlayerRankingUncheckedCreateNestedManyWithoutPlayerInput
  }

  export type PlayerCreateOrConnectWithoutTrendingInput = {
    where: PlayerWhereUniqueInput
    create: XOR<PlayerCreateWithoutTrendingInput, PlayerUncheckedCreateWithoutTrendingInput>
  }

  export type PlayerUpsertWithoutTrendingInput = {
    update: XOR<PlayerUpdateWithoutTrendingInput, PlayerUncheckedUpdateWithoutTrendingInput>
    create: XOR<PlayerCreateWithoutTrendingInput, PlayerUncheckedCreateWithoutTrendingInput>
    where?: PlayerWhereInput
  }

  export type PlayerUpdateToOneWithWhereWithoutTrendingInput = {
    where?: PlayerWhereInput
    data: XOR<PlayerUpdateWithoutTrendingInput, PlayerUncheckedUpdateWithoutTrendingInput>
  }

  export type PlayerUpdateWithoutTrendingInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rankings?: PlayerRankingUpdateManyWithoutPlayerNestedInput
  }

  export type PlayerUncheckedUpdateWithoutTrendingInput = {
    sleeperId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    team?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    injuryStatus?: NullableStringFieldUpdateOperationsInput | string | null
    practiceParticipation?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartPosition?: NullableStringFieldUpdateOperationsInput | string | null
    depthChartOrder?: NullableIntFieldUpdateOperationsInput | number | null
    searchRank?: NullableIntFieldUpdateOperationsInput | number | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    yearsExp?: NullableIntFieldUpdateOperationsInput | number | null
    metadata?: JsonNullValueInput | InputJsonValue
    lastRefreshedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rankings?: PlayerRankingUncheckedUpdateManyWithoutPlayerNestedInput
  }

  export type ContentSourceCreateWithoutItemsInput = {
    id?: string
    name: string
    type: string
    url: string
    refreshIntervalMins?: number
    lastFetchedAt?: Date | string | null
    isActive?: boolean
  }

  export type ContentSourceUncheckedCreateWithoutItemsInput = {
    id?: string
    name: string
    type: string
    url: string
    refreshIntervalMins?: number
    lastFetchedAt?: Date | string | null
    isActive?: boolean
  }

  export type ContentSourceCreateOrConnectWithoutItemsInput = {
    where: ContentSourceWhereUniqueInput
    create: XOR<ContentSourceCreateWithoutItemsInput, ContentSourceUncheckedCreateWithoutItemsInput>
  }

  export type ContentSourceUpsertWithoutItemsInput = {
    update: XOR<ContentSourceUpdateWithoutItemsInput, ContentSourceUncheckedUpdateWithoutItemsInput>
    create: XOR<ContentSourceCreateWithoutItemsInput, ContentSourceUncheckedCreateWithoutItemsInput>
    where?: ContentSourceWhereInput
  }

  export type ContentSourceUpdateToOneWithWhereWithoutItemsInput = {
    where?: ContentSourceWhereInput
    data: XOR<ContentSourceUpdateWithoutItemsInput, ContentSourceUncheckedUpdateWithoutItemsInput>
  }

  export type ContentSourceUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    refreshIntervalMins?: IntFieldUpdateOperationsInput | number
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContentSourceUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    refreshIntervalMins?: IntFieldUpdateOperationsInput | number
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContentItemCreateWithoutSourceInput = {
    id?: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt?: Date | string | null
    authorName?: string | null
    rawContent: string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemCreateplayerIdsInput | string[]
    teamSlugs?: ContentItemCreateteamSlugsInput | string[]
    topics?: ContentItemCreatetopicsInput | string[]
    importanceScore?: number | null
    noveltyScore?: number | null
    fetchedAt?: Date | string
  }

  export type ContentItemUncheckedCreateWithoutSourceInput = {
    id?: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt?: Date | string | null
    authorName?: string | null
    rawContent: string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemCreateplayerIdsInput | string[]
    teamSlugs?: ContentItemCreateteamSlugsInput | string[]
    topics?: ContentItemCreatetopicsInput | string[]
    importanceScore?: number | null
    noveltyScore?: number | null
    fetchedAt?: Date | string
  }

  export type ContentItemCreateOrConnectWithoutSourceInput = {
    where: ContentItemWhereUniqueInput
    create: XOR<ContentItemCreateWithoutSourceInput, ContentItemUncheckedCreateWithoutSourceInput>
  }

  export type ContentItemCreateManySourceInputEnvelope = {
    data: ContentItemCreateManySourceInput | ContentItemCreateManySourceInput[]
    skipDuplicates?: boolean
  }

  export type ContentItemUpsertWithWhereUniqueWithoutSourceInput = {
    where: ContentItemWhereUniqueInput
    update: XOR<ContentItemUpdateWithoutSourceInput, ContentItemUncheckedUpdateWithoutSourceInput>
    create: XOR<ContentItemCreateWithoutSourceInput, ContentItemUncheckedCreateWithoutSourceInput>
  }

  export type ContentItemUpdateWithWhereUniqueWithoutSourceInput = {
    where: ContentItemWhereUniqueInput
    data: XOR<ContentItemUpdateWithoutSourceInput, ContentItemUncheckedUpdateWithoutSourceInput>
  }

  export type ContentItemUpdateManyWithWhereWithoutSourceInput = {
    where: ContentItemScalarWhereInput
    data: XOR<ContentItemUpdateManyMutationInput, ContentItemUncheckedUpdateManyWithoutSourceInput>
  }

  export type ContentItemScalarWhereInput = {
    AND?: ContentItemScalarWhereInput | ContentItemScalarWhereInput[]
    OR?: ContentItemScalarWhereInput[]
    NOT?: ContentItemScalarWhereInput | ContentItemScalarWhereInput[]
    id?: StringFilter<"ContentItem"> | string
    sourceType?: StringFilter<"ContentItem"> | string
    sourceUrl?: StringFilter<"ContentItem"> | string
    title?: StringFilter<"ContentItem"> | string
    publishedAt?: DateTimeNullableFilter<"ContentItem"> | Date | string | null
    authorName?: StringNullableFilter<"ContentItem"> | string | null
    rawContent?: StringFilter<"ContentItem"> | string
    extractedFacts?: JsonFilter<"ContentItem">
    playerIds?: StringNullableListFilter<"ContentItem">
    teamSlugs?: StringNullableListFilter<"ContentItem">
    topics?: StringNullableListFilter<"ContentItem">
    importanceScore?: FloatNullableFilter<"ContentItem"> | number | null
    noveltyScore?: FloatNullableFilter<"ContentItem"> | number | null
    fetchedAt?: DateTimeFilter<"ContentItem"> | Date | string
    sourceId?: StringNullableFilter<"ContentItem"> | string | null
  }

  export type AgentRunCreateManyUserInput = {
    id?: string
    agentType: string
    status?: $Enums.AgentRunStatus
    inputJson: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: number | null
    durationMs?: number | null
    rating?: $Enums.AgentResultRating | null
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenBudgetCreateManyUserInput = {
    id?: string
    periodStart: Date | string
    tokensUsed?: number
    runsUsed?: number
  }

  export type AnalyticsEventCreateManyUserInput = {
    id?: string
    eventType: string
    payload: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AgentRunUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: EnumAgentRunStatusFieldUpdateOperationsInput | $Enums.AgentRunStatus
    inputJson?: JsonNullValueInput | InputJsonValue
    outputJson?: NullableJsonNullValueInput | InputJsonValue
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    rating?: NullableEnumAgentResultRatingFieldUpdateOperationsInput | $Enums.AgentResultRating | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenBudgetUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TokenBudgetUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
  }

  export type TokenBudgetUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    periodStart?: DateTimeFieldUpdateOperationsInput | Date | string
    tokensUsed?: IntFieldUpdateOperationsInput | number
    runsUsed?: IntFieldUpdateOperationsInput | number
  }

  export type AnalyticsEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnalyticsEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerRankingCreateManyPlayerInput = {
    id?: string
    source: string
    rankOverall: number
    rankPosition: number
    week: number
    season: number
    fetchedAt?: Date | string
  }

  export type TrendingPlayerCreateManyPlayerInput = {
    id?: string
    type: $Enums.TrendingType
    count: number
    lookbackHours?: number
    fetchedAt?: Date | string
  }

  export type PlayerRankingUpdateWithoutPlayerInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerRankingUncheckedUpdateWithoutPlayerInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerRankingUncheckedUpdateManyWithoutPlayerInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    rankOverall?: IntFieldUpdateOperationsInput | number
    rankPosition?: IntFieldUpdateOperationsInput | number
    week?: IntFieldUpdateOperationsInput | number
    season?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrendingPlayerUpdateWithoutPlayerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrendingPlayerUncheckedUpdateWithoutPlayerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrendingPlayerUncheckedUpdateManyWithoutPlayerInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTrendingTypeFieldUpdateOperationsInput | $Enums.TrendingType
    count?: IntFieldUpdateOperationsInput | number
    lookbackHours?: IntFieldUpdateOperationsInput | number
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContentItemCreateManySourceInput = {
    id?: string
    sourceType: string
    sourceUrl: string
    title: string
    publishedAt?: Date | string | null
    authorName?: string | null
    rawContent: string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemCreateplayerIdsInput | string[]
    teamSlugs?: ContentItemCreateteamSlugsInput | string[]
    topics?: ContentItemCreatetopicsInput | string[]
    importanceScore?: number | null
    noveltyScore?: number | null
    fetchedAt?: Date | string
  }

  export type ContentItemUpdateWithoutSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContentItemUncheckedUpdateWithoutSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContentItemUncheckedUpdateManyWithoutSourceInput = {
    id?: StringFieldUpdateOperationsInput | string
    sourceType?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authorName?: NullableStringFieldUpdateOperationsInput | string | null
    rawContent?: StringFieldUpdateOperationsInput | string
    extractedFacts?: JsonNullValueInput | InputJsonValue
    playerIds?: ContentItemUpdateplayerIdsInput | string[]
    teamSlugs?: ContentItemUpdateteamSlugsInput | string[]
    topics?: ContentItemUpdatetopicsInput | string[]
    importanceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    noveltyScore?: NullableFloatFieldUpdateOperationsInput | number | null
    fetchedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}