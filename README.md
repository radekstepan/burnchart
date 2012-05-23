Server for connect to GitHub Issues API and displaying a burndown chart for a current milestone.

## Requirements:

You can install all the following dependencies by running:

```bash
npm install -d
```

- [CoffeeScript](http://coffeescript.org/)
- [express](http://expressjs.com/)
- [eco](https://github.com/sstephenson/eco)
- [js-yaml](https://github.com/visionmedia/js-yaml)

## Configure:

The app is configured by pointing to a public GitHub user/project. Do so in `config.yml`:

```yaml
github_user:    ̈́'intermine'
github_project: 'InterMine'
project_name:   'Core InterMine Project'
```

## Use:

1. Start a node server using `.webserver.sh`.
2. Visit [http://0.0.0.0:3000/](http://0.0.0.0:3000/)

## Example:

![image](https://raw.github.com/radekstepan/github-burndown-chart/master/example.png)