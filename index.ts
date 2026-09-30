import { App } from "@elements/app";
import config from "#config";
import lobby from "#app/pages/home";
import signin from "#app/pages/signin";
import signup from "#app/pages/signup";
import game from "#app/pages/game";
import player from "#app/pages/player";
import notFound from "#app/pages/errors/not-found";
import unhandled from "#app/pages/errors/unhandled";
import { clearThisHost } from "#app/shared/services/lobby";
import { SweepFlagsJob } from "#app/jobs/sweep-flags";

const app = new App();

app.route("/", lobby);
app.route("/signin", signin);
app.route("/signup", signup);
app.route("/games/:id", game);
app.route("/players/:handle", player);

app.error((req, res, err) => {
  switch (err.statusCode) {
    case 404:
      return notFound(req, res, err);

    default:
      return unhandled(req, res, err);
  }
});

// Open pages detect a flag fall themselves; this catches games nobody is watching.
app.cron("every 1m", "sweep flags", () => new SweepFlagsJob().schedule());

app.start(config);

clearThisHost();
