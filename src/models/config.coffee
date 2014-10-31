Model = require '../utils/ractive/model.coffee'

module.exports = new Model

  'name': 'models/config'

  "data":
    # Firebase app name.
    "firebase": "burnchart"
    # Data source provider.
    "provider": "github"
    # Fields to keep from GH responses.
    "fields":
      "milestone": [
        "closed_issues"
        "created_at"
        "description"
        "due_on"
        "number"
        "open_issues"
        "title"
        "updated_at"
      ]
    # Chart configuration.
    "chart":
      # Days we are not working. Mon = 1
      "off_days": [ ]
      # How do we parse GitHub dates?
      "datetime": /^(\d{4}-\d{2}-\d{2})T(.*)/
      # How does a size label look like?
      "size_label": /^size (\d+)$/
      # Process all issues as one size (ONE_SIZE) or use labels (LABELS).
      "points": 'ONE_SIZE'
    # Request pertaining.
    "request":
      # Default timeout of 5s.
      "timeout": 5e3