import { Injectable } from '@angular/core';
import { Network, DataSet, Options, Data, IdType, Edge } from 'vis';
import { Node } from '../models/network.model';
@Injectable()
export class AppNetworkInitService {

  public nameAuthors:any = [];

  getNodes(): DataSet<Node> {
    console.log(this.nameAuthors)
    const nodesData: Node[] = this.nameAuthors.map((author: { researcher: any; publications: any; }) => ({
      id: author.researcher,
      label: author.researcher,
      value: author.publications
    }));

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
