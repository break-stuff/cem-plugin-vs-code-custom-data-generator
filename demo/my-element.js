/**
 * @attr {boolean} disabled - disables the element
 * @attribute {string} foo - description for foo
 * @attribute {1 | 2 | 3 | 4} foo-alt - description for foo
 *
 * @csspart bar - Styles the color of bar
 *
 * @slot - This is a default/unnamed slot
 * @slot container - You can put some elements here
 *
 * @cssprop --text-color - Controls the color of foo
 * @cssproperty [--background-color=red] - Controls the color of bar
 *
 * @prop {boolean} prop1 - some description
 * @property {number} prop2 - some description
 *
 * @fires custom-event - some description for custom-event
 * @fires {Event} typed-event - some description for typed-event
 * @event {CustomEvent} typed-custom-event - some description for typed-custom-event
 *
 * @summary My custom component. Here is its [documentation](https://github.com/microsoft/vscode-custom-data/blob/master/samples/webcomponents/src/components/my-component/docs.md).\nUse it like this:\n```html\n<my-component type='text'></my-component>\n<my-component\n  type='color'\n  color='#00bb00'\n></my-component>\n```
 * 
 * @reference Google - https://google.com
 * @reference MDN - https://developer.mozilla.org/en-US/
 *
 * @tag my-element
 * @tagname my-element
 */
 class MyElement extends HTMLElement {}

 customElements.define('my-element', MyElement);