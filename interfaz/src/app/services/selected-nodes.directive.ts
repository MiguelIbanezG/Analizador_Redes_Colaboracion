import {
    Directive,
    ElementRef,
    Renderer2,
    Input,
    OnInit,
    AfterViewInit,
    OnDestroy,
    Injectable,
  } from '@angular/core';
  import { Network, Data } from 'vis';
  import { AppNetworkService } from '../services/network.service';
  import { Observable, Subscription } from 'rxjs';
  import { NgModule } from '@angular/core';
  
  @Directive({
    selector: '[selected-nodes]',
  })

  export class SelectedNodesDirective implements OnInit, OnDestroy {
    @Input('selected')
      selected!: Observable<Data>;
    subscriptions: Subscription;
    constructor(
      private el: ElementRef,
      private renderer: Renderer2,
      private appNetworkService: AppNetworkService
    ) {
      this.subscriptions = new Subscription();
    }
  
    ngOnInit(): void {
      this.subscriptions.add(
        this.selected.subscribe((value: Data) => {
          const network = new Network(
            this.el.nativeElement,
            value,
            this.appNetworkService.getNetworkOptions()
          );
        })
      );
    }
    ngOnDestroy(): void {
      if (this.subscriptions) this.subscriptions.unsubscribe();
    }
  }
  