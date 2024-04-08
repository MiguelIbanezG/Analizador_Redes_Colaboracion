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
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrl: './networks.component.scss'
})
export class NetworksComponent implements OnInit, OnDestroy {

  @ViewChild('menuDiv', { static: true })
  menuDiv!: ElementRef;

  @ViewChild('treeContainer', { static: true })
  treeContainer!: ElementRef;
  nameAuthor: any;

  menuStatus: boolean = true;
  selectNode: any;
  selectEdge: any;
  prevSelectNode: any;
  publications: any[] = [];
  publicationsNode: { [key: string]: string[] } = {};
  objectKeys = Object.keys;

  private data: any = {};
  private nodes: DataSet<Node> = new DataSet<Node>();
  private edges: DataSet<Edge> = new DataSet<Edge>();
  public selectedData: Subject<Data>;
  private network!: Network;

  constructor(
    private appNetworkService: AppNetworkService,
    private appNetworkInitService: AppNetworkInitService,
  ) {
    this.selectedData = new Subject<Data>();
  }

  public ngOnInit(): void {


    this.nameAuthor = this.appNetworkInitService.selectedAuthors;

    const networkOptions = this.appNetworkService.getNetworkOptions();
    networkOptions.height = '800px'; 


    this.nodes = this.appNetworkInitService.getNodes();
    this.edges = this.appNetworkInitService.getEdges();
    this.data = {
      nodes: this.nodes,
      edges: this.edges,
    };

    this.network = new Network(
      this.treeContainer.nativeElement,
      this.data,
      networkOptions
    );

    this.network.on('select', (params) => this.onSelect(params));
    this.network.on('click', (params) => this.onClick(params));
  }

  public ngOnDestroy(): void {
    if (this.network != null) this.network.destroy();
  }

  private onClick(params: any): void {

   
    if (params.nodes.length < 1) {
      if (params.edges.length > 0) {
        this.onClickEdge(params);
      }
    }

}

  private onClickEdge(params: any): void {

    const edgeId = params.edges[0];

    const edge = this.edges.get(edgeId);

    this.publications = [];

    this.selectEdge = {
      edge: edge,
      type: 'edge'
    };

    const researcherName = this.selectEdge.edge.to;

    this.appNetworkInitService.nameAuthors = this.appNetworkInitService.nameAuthors.map((author: any) => {
      if (author.researcher === researcherName) {
        this.publications = this.publications.concat(author.publications);
      }
      return author;
    });
    

    this.selectNode = null;
 
  }


  private onSelect(params: any): void {

    if (params.nodes.length == 1) {
      const selectedNodeId = params.nodes[0];
      const connectedEdges = this.network.getConnectedEdges(selectedNodeId);
      const connectedNodes: any[] = [];
      this.publicationsNode = {};

      connectedEdges.forEach(edgeId => {
        const edge = this.edges.get(edgeId);
        if (edge) {
          if (edge.to == params.nodes) {
            connectedNodes.push(edge.from);
          } else {
            connectedNodes.push(edge.to);
          }

          this.appNetworkInitService.nameAuthors = this.appNetworkInitService.nameAuthors.map((author: any) => {
            var uniquePublicationsSet = new Set();

            if (author.researcher === edge.to) {
              var uniquePublications: any = []
              author.publications.forEach((publication: any) => {
                 uniquePublicationsSet.add(publication);
              });

              var uniquePublications: any = Array.from(uniquePublicationsSet);

              this.publicationsNode[author.researcher] = uniquePublications;
            }
            return author;

          });

        }

      });

      const result = {
        edges: connectedNodes,
        nodes: params.nodes,
        pointer: params.pointer,
      };

      if (this.selectNode) {
        this.prevSelectNode = this.selectNode;
      }
      this.selectNode = result;
      this.selectEdge = null;
    }
  }
}

