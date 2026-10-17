package auth

type UserID string

// stringer interface
func (u UserID) String() string {
	return string(u)
}

type Identity struct {
	UserID UserID
	Email  string
	Name string
	Username string
}
