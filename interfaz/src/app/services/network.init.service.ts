import { Injectable } from '@angular/core';
import { Network, DataSet, Options, Data, IdType, Edge } from 'vis';
import { Node } from '../models/network.model';
@Injectable()
export class AppNetworkInitService {

  public nameAuthors:any = [];
  public selectedAuthors:any = [];

  getNodes(): DataSet<Node> {
    
    this.nameAuthors = this.nameAuthors.map((author: any) => {
      let researcher = author.researcher; 
  
      researcher = researcher.replace(/&aacute;/g, 'á')
          .replace(/&eacute;/g, 'é')
          .replace(/&iacute;/g, 'í')
          .replace(/&oacute;/g, 'ó')
          .replace(/&uacute;/g, 'ú')
          .replace(/&ntilde;/g, 'ñ')
          .replace(/&Aacute;/g, 'Á')
          .replace(/&Eacute;/g, 'É')
          .replace(/&Iacute;/g, 'Í')
          .replace(/&Oacute;/g, 'Ó')
          .replace(/&Uacute;/g, 'Ú')
          .replace(/&Ntilde;/g, 'Ñ')
          .replace(/&agrave;/g, 'à')
          .replace(/&egrave;/g, 'è')
          .replace(/&ograve;/g, 'ò')
          .replace(/&Agrave;/g, 'À')
          .replace(/&Egrave;/g, 'È')
          .replace(/&Ograve;/g, 'Ò')
          .replace(/&acirc;/g, 'â')
          .replace(/&Acirc;/g, 'Â')
          .replace(/&atilde;/g, 'ã')
          .replace(/&Atilde;/g, 'Ã')
          .replace(/&ouml;/g, 'ö')
          .replace(/&Ouml;/g, 'Ö');
  
      author.researcher = researcher;
  
      return author;
  });

    const distances: { [key: string]: number } = {};
    this.nameAuthors.forEach((author: any) => {
      const distance = author === this.selectedAuthors[0] ? 0 : 500 / author.publications.length ;
      distances[author.researcher] = distance;
    });

    const nodesData: Node[] = this.nameAuthors.map((author: any) => {
      let nodeSize = Math.floor(author.publications.length * 3) + 30;
      if (author.researcher === this.selectedAuthors[0]) {
          nodeSize = 100; 
      }

      var distanceFromCenter = distances[author.researcher] * 5
      const angle = Math.random() * Math.PI * 2;

      if(distanceFromCenter > 2000 ){
        distanceFromCenter =  distanceFromCenter - 1200;
      }
      else if(distanceFromCenter > 1500 ){
        distanceFromCenter =  distanceFromCenter - 700;
      }
      else if(distanceFromCenter > 1000 ){
        distanceFromCenter =  distanceFromCenter - 400;
      }
      else if(distanceFromCenter > 500 ){
        distanceFromCenter =  distanceFromCenter - 100;
      }
      else if(distanceFromCenter < 100 && distanceFromCenter != 0){
        distanceFromCenter = distanceFromCenter + 300;
      }
      
      const x = Math.cos(angle) * distanceFromCenter;
      const y = Math.sin(angle) * distanceFromCenter;

      return {
        id: author.researcher,
        label: author.researcher,
        font: {
          size: nodeSize,
          color: "#ffffff"
        },
        x: x,
        y: y
      };
    });

    const nodes: DataSet<Node> = new DataSet(nodesData);
    return nodes;
  }


  getEdges(): DataSet<Edge> {

    const edgesData: Edge[] = this.nameAuthors
    .filter((author: { researcher: any; }) => author.researcher !== this.selectedAuthors[0])
    .map((author: { publications: string | any[]; researcher: any; }) => {
      const numPublications = author.publications.length.toString();
      return { from: this.selectedAuthors[0], to: author.researcher, label: numPublications };
    });

    const edges: DataSet<Edge> = new DataSet(edgesData);
    return edges;
}
  

}
