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