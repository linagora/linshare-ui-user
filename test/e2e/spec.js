'use strict';

describe('Protractor End to end test', function() {
  it('should have a title', function() {
    browser.get('http://juliemr.github.io/protractor-demo/');
    //browser.get('http://localhost:3504');
    element(by.model('first')).sendKeys(1);
    element(by.model('second')).sendKeys(2);
    element(by.id('gobutton')).click();
    expect(element(by.binding('latest')).getText()).toEqual('3');

    //expect(browser.getTitle()).toEqual('Linshare User Interface');
  });
});
