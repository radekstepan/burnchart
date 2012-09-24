# GitHub Burndown App

An app that displays a burndown chart for your GitHub Issues.

![image](https://raw.github.com/radekstepan/github-burndown-chart/master/example.png)

## Requirements:

You can install all the following dependencies by running:

```bash
$ npm install -d
```

- [CoffeeScript](http://coffeescript.org/)
- [express](http://expressjs.com/)
- [eco](https://github.com/sstephenson/eco)
- [js-yaml](https://github.com/visionmedia/js-yaml)

## Configure:

The app is configured by pointing to a public GitHub user/project. Do so in `config.yml`:

```yaml
github_user:    'intermine'
github_project: 'InterMine'
project_name:   'Core InterMine Project'
```

The `project_name` key-value pair represents the title of the burndown chart that you will see in the top right corner of the page.

### Milestones

Then visit your GitHub project's Issues page and create a new milestone with a date due in the future. This will represent your iteration. This app will pick the Milestone with the **closest due date in the future** as the *current* one.

### Sizes

Then assign a few labels to tickets in this Milestone. These labels will represent your perceived size of the task. The label takes a form of *size [number]* so to say that an Issue is as big as *5* points I would create and assign this label (don't worry about the colors...):

```
size 5
```

### Weekends

If you have days when you do not work on a project, edit the `config.yml` file with a list of days of the week when you are off. The numbers are 1 indexed and follow the international standard of starting a week on Monday, so for a Saturday and Sunday weekend do this:

```yaml
weekend: [ 6, 7 ]
```

## Use:

```bash
$ npm start
```

Then visit [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

The **orange line** - this represents you closing the Issues as you go through them. When you hover over it you will see, for each day, what the closed Issues were and how many points are left.

The **blue line** - this represents the dropping size of the outstanding Issues planned for the iteration/Milestone.

There is nothing to save in a database so each refresh of the page fetches all of the latest information from GitHub.

Enjoy!