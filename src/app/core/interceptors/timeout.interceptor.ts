import { HttpInterceptorFn } from '@angular/common/http';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';

/**
 * Intercepts all HTTP requests and enforces a 10-second timeout.
 * If the server doesn't respond within 10s, the observable errors out,
 * which triggers finalize() in the components to hide the spinner.
 */
export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  return next(req).pipe(
    timeout(10000),
    catchError(err => {
      const elapsed = Date.now() - startTime;
      if (err instanceof TimeoutError) {
        console.error(`[Timeout] ${req.method} ${req.url} after ${elapsed}ms`);
      } else {
        console.error(`[HTTP Error] ${req.method} ${req.url} - Status: ${err?.status || 'unknown'} after ${elapsed}ms`);
      }
      return throwError(() => err);
    })
  );
};
