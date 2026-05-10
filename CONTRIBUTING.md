# Contributing to PiRC3 (PiDCTP)

Thank you for your interest in contributing to the Pi Decentralized Commerce & Trust Protocol.

## How to Contribute

### Specification Improvements
1. Open an Issue describing the proposed change
2. Reference the specific section (e.g., "Section 3: Escrow System")
3. Provide rationale and any supporting research

### Smart Contract Changes
1. Fork the repository
2. Create a feature branch from `main`
3. Write code with proper error handling (MMMEEE format)
4. Add unit tests for all new functions
5. Ensure `cargo test` passes
6. Submit a Pull Request

### Code Standards

- **Language**: Rust (Soroban SDK)
- **Error codes**: MMMEEE format (MMM=module, EEE=error number)
- **Authorization**: Always call `require_auth()` on action initiators
- **Events**: Emit events for all state-changing operations
- **Imports**: Use shared types from `contracts/shared/`

### Testing

```bash
cargo test                    # All tests
cargo test -p escrow         # Specific module
cargo test -p reputation
cargo test -p dispute
```

### Pull Request Process

1. PRs require at least 1 review
2. All tests must pass
3. No `unwrap()` without proper error handling
4. Documentation updates required for new features

## Reporting Issues

- **Bugs**: Open an Issue with reproduction steps
- **Security vulnerabilities**: Email security@pidctp.org (do NOT publicly disclose)
- **Feature requests**: Open an Issue with use case and rationale

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
