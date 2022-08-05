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
 * @reference My Reference - https://google.com
 * 
 * @test some text
 *
 * @tag my-element-2
 * @tagname my-element-2
 */
 class MyElement2 extends HTMLElement {}

 customElements.define('my-element-2', MyElement2);