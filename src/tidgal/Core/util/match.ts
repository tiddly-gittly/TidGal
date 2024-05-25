class Matcher<T, R = any> {
  private readonly subject: T;
  private result: R | undefined;
  private isEnd = false;

  public constructor(subject: T) {
    this.subject = subject;
  }

  public with(pattern: T, function_: () => R): this {
    if (!this.isEnd && this.subject === pattern) {
      this.result = function_();
      this.isEnd = true;
    }
    return this;
  }

  public endsWith(pattern: T, function_: () => R) {
    if (!this.isEnd && this.subject === pattern) {
      this.result = function_();
      this.isEnd = true;
    }
    return this.evaluate();
  }

  public default(function_: () => R) {
    if (!this.isEnd) this.result = function_();
    return this.evaluate();
  }

  private evaluate(): R | undefined {
    return this.result;
  }
}

export function match<T, R = any>(subject: T): Matcher<T, R> {
  return new Matcher(subject);
}
