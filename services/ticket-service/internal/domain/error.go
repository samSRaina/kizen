package domain

import "errors"

var (
	ErrTicketExists = errors.New("ticket already exists")
)
