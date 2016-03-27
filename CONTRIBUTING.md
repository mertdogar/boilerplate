# Contribution Guide

## Code styling
Our code styling is mainly depending on [Google's Javascript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml). The differences are:
- Indentation is 4 spaces.
- Multiple `var` declerations are allowed. Actually single `var` pattern is preffered, but not strictly.
- Curly braces are not required. No need to use them for single line if statements.
- All the methods must be seperated with 2 lines.
- JSDoc is a must for methods. No need to describe deeply, a short summary is enough.

#### JSCS Rules
We use JSCS Linter for persisting and checking our code style. Please use JSCS linter plugin for your favorite editor.
- [Atom Plugin](https://atom.io/packages/linter-jscs)
- [Sublime Text 3 Plugin](https://packagecontrol.io/packages/SublimeLinter-jscs)
- Webstorm supports JSCS built-in (: Check out [this link](https://www.jetbrains.com/webstorm/help/jscs.html).

#### Method Chaining & Promise Chaining
Do this:
```javascript
someObject
    .doSomething()
    .then(function() {
        ...
    })
    .then(function() {
        ...
    })
    .catch(...);
```
Instead of this:
```javascript
someObject.doSomething().then(function() {
    ...
}).then(function() {
    ...
}).catch(...);
```
Also we're trying to use just one `catch` at the bottom, but there can be some exceptions for sure.

## Commit Messages
Check [AngularJS's commit message guide](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit). This guideline almost became an industry standard.

Summary:
- Use `<type>(<component>): <subject>` pattern for title.
- Allowed types:
    - **feat**: A new feature
    - **fix**: A bug fix
    - **docs**: Documentation only changes
    - **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    - **refactor**: A code change that neither fixes a bug nor adds a feature
    - **perf**: A code change that improves performance
    - **test**: Adding missing tests
    - **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation
- Maximum line width is 100 chars.
- Related issue is written to commit body/footer. Programmers don't need to see issue id while browsing commits.

Some examples:
```
feat(grid): Implement row highlight functionality

DEV-331
```
```
fix(dashboard): Fix device hardware pie chart

DEV-250
```

## Pull Requests
- Pull requests has to follow every guideline mentioned above.
- The title of pull request has to be related issue id. If pull request relates multiple issue, issue ids are seperated with comma. Ex: `DEV-251`, `DEV-340, DEV-311`.
- Lint your code before commiting.
- Test your shit before submitting pull request.

## TODO:
- Add grunt task for JSCS linting.
