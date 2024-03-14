import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Network, DataSet, Data, Edge } from 'vis';
import { AppNetworkService } from '../services/network.service';
import { Subject } from 'rxjs';
import { AppNetworkInitService } from '../services/network.init.service';
import { Node } from '../models/network.model'
import { SelectedNodesDirective } from '../services/selected-nodes.directive';
import { ApiService } from '../services/api.service';
import { Chart } from 'chart.js';
import { InfoService } from '../services/info.service';
import { SpinnerService } from '../services/spinner.service';
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrl: './networks.component.scss'
})
export class NetworksComponent  implements OnInit, OnDestroy {

  @ViewChild('menuDiv', { static: true })
  menuDiv!: ElementRef;

  @ViewChild('treeContainer', { static: true })
  treeContainer!: ElementRef;

  menuStatus: boolean = true;

  selectNode: any;
  prevSelectNode: any;

  private data: any = {};

  private nodes: DataSet<Node> = new DataSet<Node>();
  private edges: DataSet<Edge> = new DataSet<Edge>();

  public selectedData: Subject<Data>;

  private network!: Network;

  private nodeNo: number = 6;

  constructor(
    private appNetworkService: AppNetworkService,
    private appNetworkInitService: AppNetworkInitService,
    private apiService: ApiService,
  ) {
    this.selectedData = new Subject<Data>();
  }

  public ngOnInit(): void {

    this.nodes = this.appNetworkInitService.getNodes();
    this.edges = this.appNetworkInitService.getEdges();
    this.data = {
      nodes: this.nodes,
      edges: this.edges,
    };

    this.network = new Network(
      this.treeContainer.nativeElement,
      this.data,
      this.appNetworkService.getNetworkOptions()
    );

  
  }

  public ngOnDestroy(): void {
    if (this.network != null) this.network.destroy();
  }

  // private onSelect(params: any): void {
  //   if (params.nodes.length == 1) {
  //     this.nodes.add({
  //       id: this.nodeNo,
  //       label: `Node ${this.nodeNo}`,
  //     });
  //     this.edges.add({
  //       from: params.nodes[0],
  //       to: this.nodeNo,
  //     });
  //     this.nodeNo++;
  //     const result = {
  //       edges: params.edges,
  //       nodes: params.nodes,
  //       pointer: params.pointer,
  //     };
  //     if (this.selectNode) {
  //       this.prevSelectNode = this.selectNode;
  //     }
  //     this.selectNode = result;

  //     const newEdges = this.edges
  //       .get()
  //       .filter((value) => {
  //         return this.network
  //           .getSelectedEdges()
  //           .some((val) => val == value['id']);
  //       })
  //       .map((value) => {
  //         return { to: value['to'], from: value['from'] };
  //       });

  //     const rootSelected: number = <number>this.network.getSelectedNodes()[0];

  //     let newNodes = this.nodes.get().filter((value) => {
  //       return newEdges.some((s) => s.to == value.id);
  //     });

  //     if (!newNodes.some((value) => value.id == rootSelected)) {
  //       const self = this.nodes.get().find((val) => val.id == rootSelected);
  //       if (self !== undefined) {
  //           newNodes.unshift(self);
  //       }
  //     } else {
  //       const root = this.nodes.get()[0];
  //       newNodes.unshift(root);
  //     }
  //     this.selectedData.next({ edges: newEdges, nodes: newNodes });
  //   }
  // }
}

