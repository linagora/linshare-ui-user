_This file will serve as a guide to inform about every common issues the development team as encountered._

## Third-parties library

### NgTable

Every directive **ng-if** used inside the tag <table> as to be put as is, whitout *data-* or *x-*.

```html
<!-- Do -->
<table> 
  ...
  <td data-header="'aheader.html'"
      ng-if="linshareModeProduction == false">
  ...
</table>

<!-- Don't -->
<table> 
  ...
  <td data-header="'aheader.html'"
      x-ng-if="linshareModeProduction == false">
  ...
</table>
```


