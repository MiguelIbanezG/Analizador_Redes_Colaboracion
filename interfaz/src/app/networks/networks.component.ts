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
import { auth } from 'neo4j-driver';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrl: './networks.component.scss'
})
export class NetworksComponent  implements OnInit, OnDestroy {
[x: string]: any;

  @ViewChild('menuDiv', { static: true })
  menuDiv!: ElementRef;

  @ViewChild('treeContainer', { static: true })
  treeContainer!: ElementRef;

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

    this.network.on('select', (params) => this.onSelect(params));
    this.network.on('click', (params) => this.onClickEdge(params));
  }

  public ngOnDestroy(): void {
    if (this.network != null) this.network.destroy();
  }

  private onClickEdge(params: any): void {
    // Get the edge information
    const edgeId = params.edges[0];
    const edge = this.edges.get(edgeId);
    this.publications = [];
  
    // Update selectNode with edge information
    this.selectEdge = {
      edge: edge,
      type: 'edge'
    };

    const researcherName = this.selectEdge.edge.to; 

    this.appNetworkInitService.nameAuthors = this.appNetworkInitService.nameAuthors.map((author: any) => {
      if (author.researcher === researcherName) {
        // Concatenar las publicaciones del autor a this.publications
        this.publications = this.publications.concat(author.publications);
      }
      return author;
    });

    console.log(this.publications)
  }

  private onSelect(params: any): void {
    if (params.nodes.length == 1) {
      const selectedNodeId = params.nodes[0];
      const connectedEdges = this.network.getConnectedEdges(selectedNodeId);
      const connectedNodes: any[] = [];
      this.publicationsNode = {};
      
      connectedEdges.forEach(edgeId => {
        const edge = this.edges.get(edgeId);
        if (edge) { // Comprobación de nulidad
          if(edge.to == params.nodes ){
            connectedNodes.push(edge.from);
          }else  {
            connectedNodes.push(edge.to);
          }

          this.appNetworkInitService.nameAuthors = this.appNetworkInitService.nameAuthors.map((author: any) => {
            if (author.researcher === edge.to) {
              const uniquePublications = new Set<string>();
              // Agregar las publicaciones del autor al conjunto de publicaciones únicas
              author.publications.forEach((publication: any) => {
                  uniquePublications.add(publication);
              });
              // Convertir el conjunto de publicaciones únicas de nuevo a un arreglo
              this.publicationsNode[author.researcher] = Array.from(uniquePublications);
           }
            return author;
            
          });
       
        }
    
      });

      connectedEdges.forEach(edgeId => {
        const edge = this.edges.get(edgeId);
        if (edge !== null) { // Comprobación de nulidad
          if(edge.to == params.nodes ){

          }else  {
            connectedNodes.push(edge.to);
          }
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
    }
  }
}

