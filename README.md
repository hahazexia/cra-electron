## Create React App with electron

cra-electron is a example about how to achieve `create-react-app` with multiple entry points work for `electron`.

### why

I thought about making a electron app with react. And i realized it must be multiple entry points, because there will be several `BrowserWindow` in app. So one `BrowserWindow` will has one react application. That is to say, it has to set up as a multiple page application.

Then i found out if i want to make this happen with `create-react-app`, i must `eject` it and change the webpack config , otherwise there is no way to achieve it.

After that, i search for multiple page application with react, and in `create-react-app` i found this issue: <a href="https://github.com/facebook/create-react-app/issues/1084#issuecomment-538639068">Add more entry points
#1084</a>. In that issue <a href="https://github.com/iamandrewluca">iamandrewluca</a> make a example about how to achieve multiple entry points with `create-react-app`, here it is: <a href="https://github.com/iamandrewluca/example-cra-multi-entry">example-cra-multi-entry</a>.

Really thank <a href="https://github.com/iamandrewluca">iamandrewluca</a>, because his example gives me inspiration.

### how

1. install `create-react-app` globally, then run 

```
npx create-react-app my-app
```

to initialize a react app.

2. then run 

```
npm run eject
```
this will move all configuration directly into your project, so you can meke a custom setup.

3. 