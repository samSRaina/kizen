package domain

import "errors"

var (
	ErrTicketExists   = errors.New("ticket already exists")
	ErrTicketNotFound = errors.New("ticket not found")
)
