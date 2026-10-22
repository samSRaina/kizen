package middleware

import "net/http"

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-ALlow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-ALlow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-ALlow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-ALlow-Credentials", "true")

		// for preflight requests immediately return no content 204
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})

}
