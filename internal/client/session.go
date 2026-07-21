package client

import (
	"bufio"
	"fmt"
	"io"
	"log/slog"
	"net"
	"strings"
	"sync"
)

type session interface {
	WriteMessage(string, ...any)
	ReadMessage() (string, error)
	Shutdown()
	Close() error
}

type clientSession struct {
	logger     *slog.Logger
	conn       net.Conn
	scanner    *bufio.Scanner
	mutex      sync.Mutex
	connClosed bool
}

func newSession(logger *slog.Logger, conn net.Conn) session {
	return &clientSession{
		logger:  logger,
		conn:    conn,
		scanner: bufio.NewScanner(conn),
	}
}

func (s *clientSession) ReadMessage() (string, error) {
	if s.scanner.Scan() {
		return s.scanner.Text(), nil
	}

	if err := s.scanner.Err(); err != nil && !s.connClosed {
		return "", fmt.Errorf("tcp reader error: %w", err)
	}

	return "", io.EOF
}

func (s *clientSession) WriteMessage(message string, a ...any) {
	message = fmt.Sprintf(message, a...)
	if strings.ContainsAny(message, "\r\n\x00") {
		s.logger.Warn("invalid irc message")
		return
	}

	s.mutex.Lock()
	defer s.mutex.Unlock()

	if s.connClosed {
		return
	}

	s.logger.Debug("outbound message", "text", message)
	s.write(message)
	s.write("\r\n")
}

func (s *clientSession) write(message string) {
	_, err := io.WriteString(s.conn, message)
	if err != nil {
		s.logger.Warn("failed to write to tcp stream", "error", err)
	}
}

func (s *clientSession) Shutdown() {
	s.WriteMessage("QUIT :https://codeberg.org/parfentjev/poring")
	if err := s.Close(); err != nil {
		s.logger.Warn("failed to close connection", "error", err)
	}
}

func (s *clientSession) Close() error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if s.connClosed {
		return nil
	}

	s.connClosed = true
	return s.conn.Close()

}
