# Borodutch Club backend

This is the code for the Borodutch Club backend.

## Installation and local launch

1. Clone this repo: `git clone https://github.com/backmeupplz/borodutch-club-backend`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests.

## Environment variables

| Name                   | Description               |
| ---------------------- | ------------------------- |
| `MONGO`                | URL of the mongo database |
| `JWT`                  | secret for JWT            |
| `TELEGRAM_LOGIN_TOKEN` | Telegram login bot        |

Also, please, consider looking at `.env.sample`.

## Continuous integration

Any commit pushed to main gets deployed to [backend.club.borodutch.com](https://backend.club.borodutch.com) via [CI Ninja](https://github.com/backmeupplz/ci-ninja).
