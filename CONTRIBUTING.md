# Contributing to Barber Shop CRM

We love your input! We want to make contributing to Barber Shop CRM as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the docs/ with any new documentation.
3. The PR will be merged once you have the sign-off of at least one other developer.
4. Make sure the PR title follows our [conventional commits](https://www.conventionalcommits.org/) format.

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/barber-shop-crm/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/barber-shop-crm/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

- Use 2 spaces for indentation rather than tabs
- You can try running `npm run lint` for style unification

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
- Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or
  advances of any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Project Structure

```
barber-shop-crm/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── backend/              # Node.js backend application
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utility functions
│   └── tests/           # Backend tests
└── docs/                # Project documentation
```

## Development Setup

1. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

2. Set up environment:

```bash
# Backend
cp .env.example .env
# Edit .env with your settings
```

3. Start development servers:

```bash
# Backend
npm run dev

# Frontend
npm start
```

## Testing

- Backend tests: `npm test`
- Frontend tests: `npm test`
- E2E tests: `npm run test:e2e`

## Documentation

- API documentation is available at `/api-docs` in development
- Component documentation is in the `docs/` directory
- Update documentation when making changes to APIs or components

## Questions?

Don't hesitate to ask. We're always happy to help!
