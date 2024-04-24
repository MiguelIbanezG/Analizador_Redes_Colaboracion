import { Injectable } from '@angular/core';
import { DataSet, Edge } from 'vis';
import { Node } from '../models/network.model';
@Injectable()
export class AppNetworkInitService {

  public nameAuthors:any = [];
  public completeAuthors:any = [];
  public selectedAuthors:any = [];
  public cluster: { min: number, max: number} =  { min: 1, max: 100}

  // Function to create Nodes
  getNodes(): DataSet<Node> {

    console.log(this.cluster)

    this.nameAuthors = this.completeAuthors;


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
    
    // Group authors by the number of publications less than cluster.min
    const groupedAuthors: { [key: string]: string[] } = {};
    this.nameAuthors.forEach((author: { publications: string | any[]; researcher: string; }) => {
        if ((author.publications.length < this.cluster.min || author.publications.length > this.cluster.max) && author.researcher != this.selectedAuthors[0]) {
            const publicationCount = author.publications.length.toString();
            if (!groupedAuthors[publicationCount]) {
                groupedAuthors[publicationCount] = [];
            }
            groupedAuthors[publicationCount].push(author.researcher);
        }
    });
    console.log(Object.values(groupedAuthors));
    console.log(Object.keys(groupedAuthors));


    this.nameAuthors = this.nameAuthors.filter((author: { publications: string[]; researcher: boolean; }) => 
      (author.publications.length >= this.cluster.min && author.publications.length <= this.cluster.max) || 
      author.researcher == this.selectedAuthors[0]
    );
    

    // Create new authors for each group
    Object.keys(groupedAuthors).forEach(publicationCount => {
        const authors = groupedAuthors[publicationCount];
        const newAuthor = { researcher: publicationCount, publications: authors };
        console.log(newAuthor)
        this.nameAuthors.push(newAuthor);
    });


    console.log(this.nameAuthors)
        

    const authorWithMostPublications = this.nameAuthors.reduce((prevAuthor: any, currentAuthor: any) => {
      if (currentAuthor.researcher !== this.selectedAuthors[0]) {
          if (!prevAuthor || currentAuthor.publications.length > prevAuthor.publications.length) {
              return currentAuthor;
          }
      }
      return prevAuthor;
    }, null);

    const authorWithLeastPublications = this.nameAuthors.reduce((prevAuthor: { publications: string | any[]; }, currentAuthor: { publications: string | any[]; }) => {
      return (prevAuthor.publications.length < currentAuthor.publications.length) ? prevAuthor : currentAuthor;
    });

    const maxPublications = authorWithMostPublications.publications.length;
    const minPublications = authorWithLeastPublications.publications.length;

    let distances: { [key: string]: number } = {};
    this.nameAuthors.forEach((author: any) => {
        if (author.researcher != this.selectedAuthors[0]) {
            if(maxPublications == minPublications){ 
              distances[author.researcher] = 250;
            } else{
              const proportion = (maxPublications - author.publications.length) / (maxPublications - minPublications);
              const distance = (Math.pow(proportion, 4) * 300 + 400) * 4; 
              distances[author.researcher] = distance;
            }
        }
    });

    const sortedAuthors = this.nameAuthors.slice().sort((a: any, b: any) => {
      return a.publications.length - b.publications.length;
    });

    const totalAuthors = sortedAuthors.length;
    const angleStep = (Math.PI * 2) / totalAuthors;
    let currentAngle = 0;

    const nodesData: Node[] = sortedAuthors.map((author: any) => {

      let nodeSize = Math.floor(author.publications.length * 4) + 60;

      if (author.researcher === this.selectedAuthors[0]) {
        nodeSize = nodeSize + 50; 
      }
      if(nodeSize > 200){
        nodeSize = 200
      }


      var distanceFromCenter = 0;

      if(this.selectedAuthors[0] != author.researcher){

        var distanceFromCenter = distances[author.researcher];

        var x = Math.cos(currentAngle) * distanceFromCenter ;
        var y = Math.sin(currentAngle) * distanceFromCenter ;

        currentAngle += angleStep;
  
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


      } else{

        console.log(author.researcher)

        return {
          id: author.researcher,
          label: author.researcher,
          font: {
            size: nodeSize,
            color: "#ffffff"
          },
          x: 0,
          y: 0
        };
      }
 
    });

    const nodes: DataSet<Node> = new DataSet(nodesData);
    return nodes;
  }

  // Function to create Edges
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

  getClusterMin(): number {
    return this.cluster.min;
  }

  setClusterMin(value: number): void {
    this.cluster.min = value;
  }

  getClusterMax(): number {
    return this.cluster.max;
  }

  setClusterMax(value: number): void {
    this.cluster.max = value;
  }
  

}
