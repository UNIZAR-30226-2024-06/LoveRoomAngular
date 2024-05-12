import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: true
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string): any[] {
    array.sort((a, b) => a[field] - b[field]);
    return array;
  }
}
