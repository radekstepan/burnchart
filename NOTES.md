#Notes

##Write

Access a child from a root (db) reference:

    rootRef.child('users/mchen/name');

Save a new user to the db:

    var usersRef = ref.child("users");
    usersRef.set({
      alanisawesome: {
        date_of_birth: "June 23, 1912",
        full_name: "Alan Turing"
      },
      gracehop: {
        date_of_birth: "December 9, 1906",
        full_name: "Grace Hopper"
      }
    });

Flatten all data otherwise we are retrieving all children.

Check if we have a member of a group which could be used to check if we have a GitHub user stored in the db:

    // see if Mary is in the 'alpha' group
    var ref = new Firebase("https://docs-examples.firebaseio.com/web/org/users/mchen/groups/alpha");
    ref.once('value', function(snap) {
      var result = snap.val() === null? 'is not' : 'is';
      console.log('Mary ' + result + ' a member of alpha group');
    });

##Read

The following should get triggered everytime we add a new repo to our list, updating our local (Ractive) ref. It gets called for every existing member too.

    // Get a reference to our posts
    var postsRef = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog/posts");

    // Retrieve new posts as they are added to Firebase
    postsRef.on('child_added', function (snapshot) {
      var newPost = snapshot.val();
      console.log("Author: " + newPost.author);
      console.log("Title: " + newPost.title);
    });

Changes can be monitored like the following. This should work even in offline mode so we should not be changing our local state but Firebase state which calls us back with the changes.

    // Get a reference to our posts
    var postsRef = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog/posts");

    // Get the data on a post that has changed
    postsRef.on('child_changed', function (snapshot) {
      var changedPost = snapshot.val();
      console.log('The updated post title is ' + changedPost.title);
    });

When we remove a repo:

    // Get a reference to our posts
    var postsRef = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog/posts");

    // Get the data on a post that has been removed
    postsRef.on('child_removed', function (snapshot) {
      var deletedPost = snapshot.val();
      console.log('The blog post titled' + deletedPost.title + ' has been deleted');
    });

##Security

Write new users, do not update them, but allow delete.

    // we can write as long as old data or new data does not exist
    // in other words, if this is a delete or a create, but not an update
    ".write": "!data.exists() || !newData.exists()"

Accessing dynamic paths in the rules can be done using a `$` prefix. This serves as a wild card, and stores the value of that key for use inside the rules declarations:

    {
      "rules": {
         "rooms": {
            // this rule applies to any child of /rooms/, the key for each room id
            // is stored inside $room_id variable for reference
            "$room_id": {
               "topic": {
                 // the room's topic can be changed if the room id has "public" in it
                 ".write": "$room_id.contains('public')"
               }
            }
         }
      }
    }

[User-based rules](https://www.firebase.com/docs/web/guide/user-security.html).

Use `uid` from Simple Login which is a string ID guaranteed to be unique across all providers.

Grant write access for this user.

    {
      "rules": {
        "users": {
          "$user_id": {
            // grants write access to the owner of this user account
            // whose uid must exactly match the key ($user_id)
            ".write": "$user_id === auth.uid",
    
            "email": {
              // an email is only allowed in the profile if it matches
              // the auth token's email account (for Google or password auth)
              ".validate": "newData.val() === auth.email"
            }
          }
        }
      }
    }

We want repos to have a 1 to many users mapping. This way changes in one get propagated to others. The issue is that users may be kicked from a project in which case they can't see the cached stats for a repo.

We can get [repositories](https://developer.github.com/v3/repos/) for a user, but we have to get orgs too and get repos there again.

###Getting latest repo changes

Only users that have a `user` timestamp on repos < 30m (our config) can receive updates from repos. Otherwise we try to fetch the latest permissions from GitHub with a x minute/second retry.

We get the latest data from GitHub if our data is > 30s old (user configured). Then we broadcast latest changes to all other users (including us) updating the `age` timestamp on the repo. Receiving updates resets the user-set timeout.

Since we do not have control over GitHub repos, we need to take care of all situations that can arise:

1. Repo gives us 404 (does not exist or we don't have perms): remove user from `repo`.
1. Repo gives us success: add user to the `repo`; trigger a poll if needed to fetch latest data
1. GitHub times out: set a system `status` message to all
1. We run out of requests we can make: show a message to the user, similar to GitHub timeout but only to that one specific user

[GitHub shows 404](https://developer.github.com/v3/troubleshooting/#why-am-i-getting-a-404-error-on-a-repository-that-exists) when we don't have access OR repo does not exist.

Keep track of last update to a repo so we can clear old projects (later, as needed).

Only use repo name when we are adding the user to the repo, from there on use the repo `id` which will be preserved even if the repo is renamed. But the [milestones API](https://developer.github.com/v3/issues/milestones/) does not use the `id` :(, in which case we would show 404 and let the user delete this and add a new one. Alternatively, try to fetch the new repo name from GitHub after making a query to get the repo by its `id`:

  GET /repositories/:id

When fetching the issues, we can constrain on a `milestone` and `state`.

**Vulnerability**: if we share repos between users, one of them can write whatever change she wants and *spoil* the chart for others. Until we fix this, let us have a 1 repo to 1 user mapping.

##Design

###Adding a new user

- [ ] we get a `user` object from GH
- [ ] get a list of repos from FB by asking for our `user` root
- [ ] *a*: user is not there so let us create this root object
- [ ] *b*: user is there so we get back a list of repos

###Adding a new repo

- [ ] make a request to GH fetching a repo by `user/repo`
- [ ] *a*: GH gives us 404 - show a message to the user
- [ ] *b1*: we get back a repo object, so a write into our `user` root as a `set()` operation (overriding any existing entry if it exists)
- [ ] *b2*: in client register our repo to receive updates from FB and since it is new - it triggers a fetch from GH immediately

###Updating a repo

- [ ] listen for our `user`, `repo` changes from FB which actually will render new data
- [ ] our local repo object has an `age` information, if it reaches a threshold, trigger a fetch from GH
- [ ] *a*: GH gives us 404 - show a message to the user saying last `state` on the repo, e.g. last success 5 minutes ago, keep showing the *old* data if any
- [ ] *b*: GH gives us data, make an `update()` on FB saying `state` is `null` (OK) updating the `age` to time now

###Deleting a repo

- [ ] remove our `repo` under the `user`, no questions asked. All subscribers are switched off and views disposed of

###Deleting a user

- [ ] execute a `remove()` in FB if our tokens match for a user, will remove all repos too

###Upgrading an account to private repos

Private repos (extra `scope` in FB login) are part of a paid plan. Need to recognize that a user has an active paid account with us, before using the extended scope.

GH repositories have a `private` flag.

Since we do not *trust* users it is I that need to be upgrading users, at the same time it needs to be automatic.

We should not kill a user if they are no longer paid, maybe they got behind a payment, just disable latest data from private repos.

Set the private scope on all auth and put the burden on me to proove who has paid for an account or not, since someone could send a request to FB saying that a repo is public when it is not.

I can run a script once in a while to see whose repo returns 404 when it is set as `private = false`, put the burden on me to prove.

Using a free instance of [IronWorker](http://dev.iron.io/worker/reference/environment/#maximum_run_time_per_worker) and assuming 5s runtime each time gives us a poll every 6 minutes.

[Zapier](https://zapier.com/zapbook/firebase/stripe/) would poll every 15 minutes but already integrates Stripe and FB.

Because security rules cannot override existing rules, we need to separate the table of subscribers from saving the info on the suer herself.

- [ ] fetch updates for a `private` repo only if our user has a `plan` flag set to `business` or whatever
- [ ] use a JS library to allow Stripe payment processing; people submit their card details and we get a Stripe `token` back. Save this token and user id on FB under `payments` collection that only adds new entries, never deletes.
- [ ] have a worker process the `payments` ever 6 minutes or faster via IronWorker
- [ ] run an extra worker to check for for repos that return 404 when user is on an `open-source` plan; this is to find cheaters
- [ ] run an extra worker that checks for `business` plans and if we have payments for these or not
