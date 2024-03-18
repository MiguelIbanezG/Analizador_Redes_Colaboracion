import { Injectable } from '@angular/core';
import { Network, DataSet, Options, Data, IdType, Edge } from 'vis';
import { Node } from '../models/network.model';
@Injectable()
export class AppNetworkInitService {

  public nameAuthors:any = [];

  getNodes(): DataSet<Node> {
    // Obtener al autor con más publicaciones
    const authorWithMostPublications = this.nameAuthors.reduce((prev: any, current: any) => (prev.publications.length > current.publications.length) ? prev : current);

    const distances: { [key: string]: number } = {};
    this.nameAuthors.forEach((author: any) => {
      const distance = author === authorWithMostPublications ? 0 : 500 / author.publications.length ;
      distances[author.researcher] = distance;

    });

    

    // Mapear los nodos ajustando el tamaño en función de las publicaciones y la distancia al autor principal
    const nodesData: Node[] = this.nameAuthors.map((author: any) => {
      var distanceFromCenter = distances[author.researcher] * 5
      const angle = Math.random() * Math.PI * 2;



      if(distanceFromCenter > 2000 ){
        distanceFromCenter =  distanceFromCenter - 1750;
      }
      else if(distanceFromCenter > 1500 ){
        distanceFromCenter =  distanceFromCenter - 1100;
      }
      else if(distanceFromCenter > 1000 ){
        distanceFromCenter =  distanceFromCenter - 750;
      }
      else if(distanceFromCenter > 500 ){
        distanceFromCenter =  distanceFromCenter - 200;
      }
      else if(distanceFromCenter < 100 && distanceFromCenter != 0){
        distanceFromCenter = distanceFromCenter + 100;
      }
      const x = Math.cos(angle) * distanceFromCenter;
      const y = Math.sin(angle) * distanceFromCenter;
      console.log(author.researcher);
      console.log(distanceFromCenter);
      return {
        id: author.researcher,
        label: author.researcher,
        font: {
          size: Math.floor(author.publications.length) + 12, // Tamaño de fuente ajustado
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
    // Ordenar los autores por el número de publicaciones en orden descendente
    const sortedAuthors = this.nameAuthors.sort((a: { publications: string | any[]; }, b: { publications: string | any[]; }) => b.publications.length - a.publications.length);
  
    // Tomar al primer autor de la lista, que será el autor con más publicaciones
    const authorWithMostPublications = sortedAuthors[0];
  
    // Generar aristas conectando al autor con más publicaciones con todos los demás autores
    const edgesData: Edge[] = this.nameAuthors.filter((author: { researcher: any; }) =>
      author.researcher !== authorWithMostPublications.researcher
    ).map((author: { researcher: any; }) =>
      ({ from: authorWithMostPublications.researcher, to: author.researcher })
    );
  
    const edges: DataSet<Edge> = new DataSet(edgesData);
    return edges;
  }
  

}
